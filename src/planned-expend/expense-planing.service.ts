import { BadRequestException, Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";

import { ExpensePlanning } from "../entities/expense-planning.entity";
import { PlanningService } from "../planning/planning.service";
import { CreateIncomePlanningDto } from "../planned-income/dto/create-planning-income.dto";
import { CreateExpensePlanningDto } from "./dto/createExpensePlanning.dto";

@Injectable()
export class ExpensePlanningService {
  constructor(
    @InjectRepository(ExpensePlanning)
    private plannedExpendRepository: Repository<ExpensePlanning>,
    private plannedService: PlanningService,
  ) {}
  async create(
    createExpensePlanningDto: CreateExpensePlanningDto,
  ): Promise<ExpensePlanning> {
    const existingPlanning = await this.plannedService.getById(
      createExpensePlanningDto.planning_id,
    );
    if (!existingPlanning) {
      throw new Error("La planificacion con el id proporcionado no existe");
    }
    const newPlannedExpend = this.plannedExpendRepository.create({
      ...createExpensePlanningDto,
      planning: existingPlanning,
    });
    return this.plannedExpendRepository.save(newPlannedExpend);
  }

  async getById(planned_expend_id: number): Promise<ExpensePlanning | null> {
    return this.plannedExpendRepository.findOneBy({ planned_expend_id });
  }

  async getAll(): Promise<ExpensePlanning[]> {
    return this.plannedExpendRepository.find();
  }

  async removeAll(): Promise<void> {
    const count = await this.plannedExpendRepository.count();
    if (count === 0) {
      throw new BadRequestException("No hay datos que borrar ");
    }
    await this.plannedExpendRepository.clear();
  }

  async removeById(id: number): Promise<void> {
    const existingPlannedExpend = await this.getById(id);
    const count = await this.plannedExpendRepository.count();

    if (count === 0) {
      throw new BadRequestException("No hay datos que borrar ");
    }
    if (!existingPlannedExpend) {
      throw new BadRequestException(
        `El gasto planificado con id ${id} no existe`,
      );
    }
    await this.plannedExpendRepository.delete(id);
  }
}
