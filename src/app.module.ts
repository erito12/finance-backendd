import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IncomeModule } from "./income/income.module";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Income } from "./entities/income.entity";
import { AccountModule } from "./account/account.module";
import { Account } from "./entities/account.entity";

const typeOrmConfig: TypeOrmModuleOptions = {
  type: "sqlite",
  database: "finance.db",
  entities: [Income, Account],
  synchronize: true,
};

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), IncomeModule, AccountModule],
})
export class AppModule {}
