import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { IncomeService } from "./income.service";
import { IncomeController } from "./income.controller";
import { Income } from "src/entities/income.entity";
import { AccountModule } from "src/account/account.module";

@Module({
  imports: [TypeOrmModule.forFeature([Income]), AccountModule],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomeModule {}
