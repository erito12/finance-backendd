import { TypeOrmModule } from "@nestjs/typeorm";
import { Module } from "@nestjs/common";
import { IncomePlanningService } from "./planning-income.service";
import { IncomePlanning } from "../entities/planning-income.entity";
import { PlanningModule } from "../planning/planning.module";
import { PlanningIncomeController } from "./planning-income.controller";

@Module({
  imports: [TypeOrmModule.forFeature([IncomePlanning]), PlanningModule],
  providers: [IncomePlanningService],
  controllers: [PlanningIncomeController],
})
export class IncomePlaningModule {}
