import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { IncomeService } from "./income.service";
import { IncomeController } from "./income.controller";
import { Income } from "../entities/income.entity";
import { AccountModule } from "../account/account.module";

@Module({
  imports: [TypeOrmModule.forFeature([Income]), AccountModule],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomeModule {}
