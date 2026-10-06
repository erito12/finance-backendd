import { Module } from "@nestjs/common";
import { TypeOrmModule, TypeOrmModuleOptions } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ScheduleModule } from "@nestjs/schedule";
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy";

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
import { IncomeTypeModule } from "./income-type/income-type.module";
import { IncomeDistributionEntity } from "./entities/income-distribution.entity";

export const entities = [
  IncomeEntity,
  AccountEntity,
  Expense,
  Planning,
  ExpensePlanning,
  PlannedIncome,
  PurposeEntity,
  CurrencyEntity,
  IncomeDistributionEntity,
];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService): TypeOrmModuleOptions => ({
        type: "postgres",
        host: config.get<string>("DB_HOST", "localhost"),
        port: parseInt(config.get<string>("DB_PORT", "5432"), 10),
        username: config.get<string>("DB_USERNAME", "postgres"),
        password: config.get<string>("DB_PASSWORD", ""),
        database: config.get<string>("DB_DATABASE", "financebd"),
        namingStrategy: new SnakeNamingStrategy(),
        entities,
        migrations: ["dist/database/migrations/*.js"],
        migrationsRun: true,
        synchronize: false,
        logging: config.get<string>("DB_LOGGING") === "true",
      }),
    }),
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
