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
import { PlannedExpendModule } from "./planned-expend/planned-expend.module";
import { PlannedExpend } from "./entities/planning-expend.entity";
import { IncomePlanning } from "./entities/planning-income.entity";
import { IncomePlaningModule } from "./planning-income/planning-income.module";

const typeOrmConfig: TypeOrmModuleOptions = {
  type: "sqlite",
  database: "finance.db",
  entities: [Income, Account, Expense, Planning, PlannedExpend, IncomePlanning],
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
    IncomePlaningModule,
  ],
})
export class AppModule {}
