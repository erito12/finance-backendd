import { Injectable, Logger } from "@nestjs/common";
import * as puppeteer from "puppeteer";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CurrencyEntity } from "../../../entities/currency.entity";
import { Cron, CronExpression } from "@nestjs/schedule";

@Injectable()
export class ScrapingService {
  private readonly logger = new Logger(ScrapingService.name);

  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyScraping() {
    this.logger.log("Iniciando actualización automática desde BCC...");
    await this.performScrapeAndSave();
  }

  async performScrapeAndSave() {
    const browser = await puppeteer.launch({
      headless: true, // Cambia a false si quieres ver qué hace el navegador en desarrollo
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-web-security",
        "--ignore-certificate-errors",
        "--ignore-certificate-errors-spki-list",
      ],
    });

    const page = await browser.newPage();

    // Configurar un User-Agent real para evitar bloqueos por "No autorizado"
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    );

    try {
      // Cargamos la página
      await page.goto("https://www.bc.gob.cu/", {
        waitUntil: "domcontentloaded",
        timeout: 90000,
      });

      // Esperamos a que la tabla de tasas sea visible
      await page.waitForSelector("table", { timeout: 20000 });

      const rates = await page.evaluate(() => {
        const data: Record<string, number> = {};
        // El BCC usa tablas; buscamos la que tenga info de moneda
        const rows = Array.from(document.querySelectorAll("table tr"));

        rows.forEach((row) => {
          const cells = row.querySelectorAll("td");
          if (cells.length >= 2) {
            const currency = cells[0].innerText.toUpperCase();
            // Limpiamos el valor: quitamos espacios y cambiamos coma por punto
            const valueRaw = cells[1].innerText.trim().replace(",", ".");
            const value = parseFloat(valueRaw);

            if (!isNaN(value) && value > 0) {
              if (currency.includes("USD")) data["USD"] = value;
              if (currency.includes("EUR")) data["EUR"] = value;
              if (currency.includes("CAD")) data["CAD"] = value;
              if (currency.includes("GBP")) data["GBP"] = value;
            }
          }
        });
        return data;
      });

      if (Object.keys(rates).length === 0) {
        this.logger.warn("No se encontraron tasas en la tabla del BCC.");
      } else {
        this.logger.log(`Tasas extraídas: ${JSON.stringify(rates)}`);
        await this.updateDatabaseRates(rates);
      }
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Error desconocido";
      this.logger.error(`Error en scraping: ${msg}`);
    } finally {
      await browser.close();
    }
  }

  private async updateDatabaseRates(rates: Record<string, number>) {
    for (const [code, value] of Object.entries(rates)) {
      if (value > 0) {
        try {
          const result = await this.currencyRepository.update(
            { code: code.toUpperCase() },
            { exchangeRate: value },
          );

          if (result.affected && result.affected > 0) {
            this.logger.log(`✅ Actualizado ${code}: ${value} CUP`);
          }
        } catch (dbError) {
          this.logger.error(`Error actualizando ${code} en BD`);
        }
      }
    }
  }
}
