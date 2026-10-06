import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Put,
  ValidationPipe,
} from "@nestjs/common";
import { CurrencyService } from "./currency.service";
import { ScrapingService } from "../common/service/scraper/coin-value-scraper.service";
import { UpdateExchangeRateDto } from "./dto/update-exchange-rate.dto";

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

  @Put(":code/exchange-rate")
  @Patch(":code/exchange-rate")
  async updateExchangeRate(
    @Param("code") code: string,
    @Body(new ValidationPipe({ whitelist: true }))
    updateExchangeRateDto: UpdateExchangeRateDto,
  ) {
    return this.currencyService.updateExchangeRate(
      code,
      updateExchangeRateDto.exchangeRate,
    );
  }

  @Get("force-scrape")
  async forceScrape() {
    await this.scrapingService.handleDailyScraping();
    return { message: "Scraping ejecutado manualmente" };
  }
}
