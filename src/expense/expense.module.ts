import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ExpenseService } from "./expense.service";
import { ExpenseController } from "./expense.controller";
import { Expense } from "../entities/expense.entity";
import { AccountModule } from "../account/account.module";
import { PurposeModule } from "../purpose/purpose.module";

@Module({
  imports: [TypeOrmModule.forFeature([Expense]), AccountModule, PurposeModule],
  providers: [ExpenseService],
  controllers: [ExpenseController],
})
export class ExpenseModule {}
