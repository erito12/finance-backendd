import "reflect-metadata";
import { DataSource } from "typeorm";
import { SnakeNamingStrategy } from "typeorm-naming-strategies/snake-naming.strategy";
import * as dotenv from "dotenv";

import { entities } from "../app.module";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  namingStrategy: new SnakeNamingStrategy(),
  entities,
  migrations: ["src/database/migrations/*.ts"],
  synchronize: false,
  logging: process.env.DB_LOGGING === "true",
  ssl: { rejectUnauthorized: false },
});
