// src/common/common.module.ts
import { Global, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConversionService } from "./service/conversion/conversion.service";
// Asegura la ruta
import { CurrencyEntity } from "../entities/currency.entity";
import { CurrencyService } from "../currency/currency.service";
import { ScrapingService } from "./service/scraper/coin-value-scraper.service";

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
  providers: [ConversionService, CurrencyService, ScrapingService], // Añadido aquí
  exports: [ConversionService, CurrencyService, ScrapingService], // Añadido aquí
})
export class CommonModule {}
