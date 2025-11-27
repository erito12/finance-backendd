import { PlannedExpend } from "../entities/planning-expend.entity";
import { PlanningModule } from "../planning/planning.module";
import { PlannedExpendController } from "./planned-expend.controller";
import { PlannedExpendService } from "./planned-expend.service";

import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
@Module({
  imports: [TypeOrmModule.forFeature([PlannedExpend]), PlanningModule],
  controllers: [PlannedExpendController],
  providers: [PlannedExpendService],
  exports: [PlannedExpendService],
})
export class PlannedExpendModule {}
