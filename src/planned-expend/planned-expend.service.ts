import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { PlannedExpend } from "../entities/planning-expend.entity";

@Injectable()
export class PlannedExpendService {
  // constructor(
  //   @InjectRepository(PlannedExpend)
  //   private plannedExpendRepository: Repository<PlannedExpend>,
  //   private plannedService: Planned,
  // ) {}
}
