import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { IncomePlanningService } from "./planned-income.service";
import { PlannedIncome } from "../entities/income-planning.entity";
import { PlanningModule } from "../planning/planning.module";
import { PlanningIncomeController } from "./planned-income.controller";

@Module({
  imports: [TypeOrmModule.forFeature([PlannedIncome]), PlanningModule],
  providers: [IncomePlanningService],
  controllers: [PlanningIncomeController],
})
export class PlannedIncomeModule {}
