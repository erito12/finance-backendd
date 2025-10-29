import { Module } from "@nestjs/common";
import { PlanningService } from "./planning.service";

import { Planning } from "src/entities/planning.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PlanningController } from "./planning.controller";

@Module({
  imports: [TypeOrmModule.forFeature([Planning])],
  controllers: [PlanningController],
  providers: [PlanningService],
  exports: [PlanningService],
})
export class PlanningModule {}
