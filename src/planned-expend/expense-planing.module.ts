import { ExpensePlanning } from "../entities/expense-planning.entity";
import { PlanningModule } from "../planning/planning.module";
import { PlannedExpendController } from "./expense-planning.controller";
import { ExpensePlanningService } from "./expense-planing.service";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
@Module({
  imports: [TypeOrmModule.forFeature([ExpensePlanning]), PlanningModule],
  controllers: [PlannedExpendController],
  providers: [ExpensePlanningService],
  exports: [ExpensePlanningService],
})
export class PlannedExpendModule {}
