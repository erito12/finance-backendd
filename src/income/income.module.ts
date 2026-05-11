import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { IncomeService } from "./income.service";
import { IncomeController } from "./income.controller";
import { IncomeEntity } from "../entities/income.entity";
import { AccountModule } from "../account/account.module";
import { PurposeModule } from "../purpose/purpose.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([IncomeEntity]),
    AccountModule,
    PurposeModule,
  ],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomeModule {}
