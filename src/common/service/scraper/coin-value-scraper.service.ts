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

  //actualiza las tasas de cambio cada día a las 12:00 am
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleDailyScraping() {
    this.logger.log("Iniciando actualización automática de tasas...");
    await this.performScrapeAndSave();
  }

  private async performScrapeAndSave() {
    // IMPORTANTE: En Linux/Ubuntu, añade estos argumentos para evitar errores de permisos
    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    try {
      // Vamos directamente a la página de tasas para evitar distracciones
      await page.goto("https://eltoque.com/", { waitUntil: "networkidle2" });

      // LOG DE DEPURACIÓN: Vamos a ver qué códigos encuentra realmente
      const rates = await page.evaluate(() => {
        const data = {};
        // El Toque actual suele usar un selector basado en el texto de las filas
        // Intentamos un selector más genérico que busque el código y el precio
        const items = document.querySelectorAll("tr, .rate-item"); // Ajustar según inspección

        items.forEach((item) => {
          const htmlItem = item as HTMLElement;
          const text = htmlItem.innerText || "";
          // Buscamos patrones como "USD" seguido de un número
          const match = text.match(/(USD|MLC|EUR|CUP)\s*(\d+)/);

          if (match) {
            const code = match[1];
            const value = parseFloat(match[2]);
            data[code] = value;
          }
        });
        return data;
      });

      if (Object.keys(rates).length === 0) {
        this.logger.warn(
          "No se encontraron tasas. El selector podría estar desactualizado.",
        );
        return;
      }

      await this.updateDatabaseRates(rates);
    } catch (error: any) {
      this.logger.error(`Error en scraping: ${error.message}`);
    } finally {
      await browser.close();
    }
  }

  private async updateDatabaseRates(rates: Record<string, number>) {
    for (const [code, value] of Object.entries(rates)) {
      // Solo actualizamos si el valor es mayor que 0
      if (value > 0) {
        const result = await this.currencyRepository.update(
          { code: code.toUpperCase() },
          { exchangeRate: value },
        );

        if (result.affected && result.affected > 0) {
          this.logger.log(`✅ ${code}: ${value} CUP`);
        } else {
          this.logger.warn(
            `⚠️ Moneda ${code} no encontrada en la BD (Seed fallido?)`,
          );
        }
      }
    }
  }
}
