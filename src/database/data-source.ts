import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy";
import * as dotenv from "dotenv";

import { IncomeEntity } from "../entities/income.entity";
import { AccountEntity } from "../entities/account.entity";
import { Expense } from "../entities/expense.entity";
import { Planning } from "../entities/planning.entity";
import { ExpensePlanning } from "../entities/expense-planning.entity";
import { PlannedIncome } from "../entities/income-planning.entity";
import { PurposeEntity } from "../entities/purpose.entity";
import { CurrencyEntity } from "../entities/currency.entity";
import { IncomeDistributionEntity } from "../entities/income-distribution.entity";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_DATABASE || "financebd",
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
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
  logging: process.env.DB_LOGGING === "true",
});
