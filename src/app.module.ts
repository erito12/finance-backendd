import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IncomeModule } from './income/income.module';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Income } from './income/income.entity';

const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'sqlite',
  database: 'finance.db',
  entities: [Income],
  synchronize: true,
};

@Module({
  imports: [TypeOrmModule.forRoot(typeOrmConfig), IncomeModule],
})
export class AppModule {}
