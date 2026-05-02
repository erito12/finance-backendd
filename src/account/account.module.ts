import { Module } from "@nestjs/common";
import { AccountController } from "./account.controller";
import { AccountService } from "./account.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AccountEntity } from "../entities/account.entity";
import { CurrencyEntity } from "../entities/currency.entity";
import { CommonModule } from "../common/common.module";

@Module({
  imports: [
    // 1. Registramos ambas entidades para que sus repositorios estén disponibles
    TypeOrmModule.forFeature([AccountEntity, CurrencyEntity]),
    // 2. Importamos el módulo que contiene y exporta el ConversionService
    CommonModule,
  ],
  controllers: [AccountController],
  providers: [AccountService],
  exports: [AccountService],
})
export class AccountModule {}
