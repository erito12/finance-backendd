import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";

import { IncomeService } from "./income.service";
import { IncomeController } from "./income.controller";
import { Income } from "src/entities/income.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Income])],
  providers: [IncomeService],
  controllers: [IncomeController],
})
export class IncomeModule {}
