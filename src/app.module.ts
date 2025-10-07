import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { IncomeModule } from "./income/income.module";
import { TypeOrmModuleOptions } from "@nestjs/typeorm";
import { Income } from "./income/income.entity";
import { AccountModule } from './account/account.module';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: "sqlite",
  database: "finance.db",
  entities: [Income],
  synchronize: true,
};

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), IncomeModule, AccountModule],
})
export class AppModule {}
