import { Module } from "@nestjs/common";
import { CurrencyController } from "./currency.controller";
import { CurrencyService } from "./currency.service";
import { CurrencyEntity } from "../entities/currency.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([CurrencyEntity])],
  controllers: [CurrencyController],
  providers: [CurrencyService],
  exports: [CurrencyService],
})
export class CurrencyModule {}
