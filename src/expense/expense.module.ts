import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { ExpenseService } from "./expense.service";
import { Expense } from "src/entities/expense.entity";
import { AccountModule } from "src/account/account.module";
import { ExpenseController } from "./expense.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Expense]), AccountModule],
  providers: [ExpenseService],
  controllers: [ExpenseController],
})
export class ExpenseModule {}
