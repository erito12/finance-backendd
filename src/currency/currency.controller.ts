import { Controller, Get } from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { ScrapingService } from "../common/service/scraper/coin-value-scraper.service";

@Controller("currency")
export class CurrencyController {
  constructor(
    private readonly currencyService: CurrencyService,
    private readonly scrapingService: ScrapingService,
  ) {}

  @Get()
  async findAll() {
    return this.currencyService.findAll();
  }

  @Get("force-scrape")
  async forceScrape() {
    await this.scrapingService.handleDailyScraping();
    return { message: "Scraping ejecutado manualmente" };
  }
}
