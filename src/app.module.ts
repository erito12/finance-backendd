import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";

import { IncomeModule } from "./income/income.module";
import { IncomeEntity } from "./entities/income.entity";
import { AccountModule } from "./account/account.module";
import { AccountEntity } from "./entities/account.entity";
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
import { CurrencyModule } from "./currency/currency.module";
import { CurrencyEntity } from "./entities/currency.entity";
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy";
import { ScheduleModule } from "@nestjs/schedule";
import { IncomeTypeModule } from "./income-type/income-type.module";
import { IncomeDistributionEntity } from "./entities/income-distribution.entity";

const typeOrmConfig: TypeOrmModuleOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "postgres",
  password: "Erito1234",
  database: "FinanceBD",
  // database: " real-finance-database",
  namingStrategy: new SnakeNamingStrategy(),
  entities: [
    IncomeEntity,
    AccountEntity,
    Expense,
    Planning,
    ExpensePlanning,
    PlannedIncome,
    PurposeEntity,
    CurrencyEntity,
    IncomeDistributionEntity,
  ],
  synchronize: true,
};

@Module({
  imports: [
    TypeOrmModule.forRoot(typeOrmConfig),
    ScheduleModule.forRoot(),
    IncomeModule,
    AccountModule,
    ExpenseModule,
    PlanningModule,
    PlannedExpendModule,
    PlannedIncomeModule,
    PurposeModule,
    CommonModule,
    CurrencyModule,
    IncomeTypeModule,
  ],
})
export class AppModule {}
