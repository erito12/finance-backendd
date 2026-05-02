import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

import { IncomeModule } from "./income/income.module";
import { Income } from "./entities/income.entity";
import { AccountModule } from "./account/account.module";
import { Account } from "./entities/account.entity";
import { ExpenseModule } from "./expense/expense.module";
import { Expense } from "./entities/expense.entity";
import { PlanningModule } from "./planning/planning.module";
import { Planning } from "./entities/planning.entity";
import { PlannedExpendModule } from "./planned-expend/expense-planing.module";
import { ExpensePlanning } from "./entities/expense-planning.entity";
import { PlannedIncome } from "./entities/income-planning.entity";
import { PlannedIncomeModule } from "./planned-income/planned-income.module";
import { PurposeEntity } from "./entities/purpose.entity";
import { PurposeModule } from "./purpose/purpose.module";
import { CommonModule } from "./common/common.module";

const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Erito1234",
  database: "FinanceBD",
  entities: [
    Income,
    Account,
    Expense,
    Planning,
    ExpensePlanning,
    PlannedIncome,
    PurposeEntity,
  ],
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    IncomeModule,
    AccountModule,
    ExpenseModule,
    PlanningModule,
    PlannedExpendModule,
    PlannedIncomeModule,
    PurposeModule,
    CommonModule,
  ],
})
export class AppModule {}
