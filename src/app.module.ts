// import { Module } from "@nestjs/common";
// import { TypeOrmModule } from "@nestjs/typeorm";
// import { TypeOrmModuleOptions } from "@nestjs/typeorm";

// import { IncomeModule } from "./income/income.module";
// import { Income } from "./entities/income.entity";
// import { AccountModule } from "./account/account.module";
// import { Account } from "./entities/account.entity";
// import { ExpenseModule } from "./expense/expense.module";
// import { Expense } from "./entities/expense.entity";
// import { PlanningModule } from "./planning/planning.module";
// import { Planning } from "./entities/planning.entity";
// import { PlannedExpendModule } from "./planned-expend/expense-planing.module";
// import { ExpensePlanning } from "./entities/expense-planning.entity";
// import { PlannedIncome } from "./entities/income-planning.entity";
// import { PlannedIncomeModule } from "./planned-income/planned-income.module";

// const typeOrmConfig: TypeOrmModuleOptions = {
//   type: "sqlite",
//   database: "finance.db",
//   entities: [
//     Income,
//     Account,
//     Expense,
//     Planning,
//     ExpensePlanning,
//     PlannedIncome,
//   ],
//   synchronize: true,
// };

// @Module({
//   imports: [
//     TypeOrmModule.forRoot(typeOrmConfig),
//     IncomeModule,
//     AccountModule,
//     ExpenseModule,
//     PlanningModule,
//     PlannedExpendModule,
//     PlannedIncomeModule,
//   ],
// })
// export class AppModule {}

import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";

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

@Module({
  imports: [
    // Configuración de variables de entorno
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
      cache: true,
    }),

    // PostgreSQL 18 Configuration
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>("DB_HOST", "localhost"),
        port: configService.get<number>("DB_PORT", 5432),
        username: configService.get<string>("DB_USERNAME", "postgres"),
        password: configService.get<string>("DB_PASSWORD", ""),
        database: configService.get<string>("DB_NAME", "finance_db"),

        // Entidades
        entities: [
          Income,
          Account,
          Expense,
          Planning,
          ExpensePlanning,
          PlannedIncome,
        ],

        // Configuración de sincronización
        synchronize: configService.get<string>("NODE_ENV") !== "production",

        // Logging
        logging: configService.get<boolean>("DB_LOGGING", false),

        // Pool de conexiones (optimización)
        extra: {
          max: configService.get<number>("DB_POOL_SIZE", 10),
          idleTimeoutMillis: configService.get<number>(
            "DB_IDLE_TIMEOUT",
            30000,
          ),
          connectionTimeoutMillis: configService.get<number>(
            "DB_CONNECTION_TIMEOUT",
            2000,
          ),
        },

        // SSL (para producción/cloud)
        ssl:
          configService.get<string>("NODE_ENV") === "production"
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),

    // Módulos de la aplicación
    IncomeModule,
    AccountModule,
    ExpenseModule,
    PlanningModule,
    PlannedExpendModule,
    PlannedIncomeModule,
  ],
})
export class AppModule {}
