import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PlannedIncome } from "../entities/income-planning.entity";
import { Repository } from "typeorm";
import { PlanningService } from "../planning/planning.service";
import { CreateIncomePlanningDto } from "./dto/create-planning-income.dto";

@Injectable()
export class IncomePlanningService {
  constructor(
    @InjectRepository(PlannedIncome)
    private planningIncomeRepository: Repository<PlannedIncome>,
    private planningService: PlanningService,
  ) {}

  async create(
    createPlanningIncomeDto: CreateIncomePlanningDto,
  ): Promise<PlannedIncome> {
    const existingPlanning = await this.planningService.getById(
      createPlanningIncomeDto.planning_id,
    );

    if (!existingPlanning) {
      throw new BadRequestException(
        "La planificacion con el id proporcionado no existe",
      );
    }
    // validaciones
    if (!createPlanningIncomeDto.income_planning_amount) {
      throw new BadRequestException("El monto de Ingreo es requerido");
    }

    if (!createPlanningIncomeDto.planning_id) {
      throw new BadRequestException("El id de la Planificacion es requerida");
    }
    if (!createPlanningIncomeDto.income_planning_type) {
      throw new BadRequestException("El tipo del Ingreso es requerido");
    }

    const newPlanningIncome = this.planningIncomeRepository.create({
      ...createPlanningIncomeDto,
      planning: existingPlanning,
    });
    const savePlanningIncome =
      await this.planningIncomeRepository.save(newPlanningIncome);

    return this.planningIncomeRepository.save(savePlanningIncome);
  }

  // async partialUpdate(id:nummber,
  //   update
  // )

  async getById(income_planning_id: number): Promise<PlannedIncome | null> {
    return this.planningIncomeRepository.findOneBy({ income_planning_id });
  }

  async getAll(): Promise<PlannedIncome[]> {
    return this.planningIncomeRepository.find();
  }

  async removeAll(): Promise<void> {
    const count = await this.planningIncomeRepository.count();
    if (count === 0) {
      throw new BadRequestException("No hay datos que borrar ");
    }
    await this.planningIncomeRepository.clear();
  }

  async removeById(id: number): Promise<void> {
    id;
    const existIncomePlanning = await this.getById(id);
    const count = await this.planningIncomeRepository.count();

    if (!existIncomePlanning) {
      throw new BadRequestException("Planificacion de ingreso no encontrada ");
    }
    if (count === 0) {
      throw new BadRequestException("No hay datos que borrar ");
    }

    await this.planningIncomeRepository.delete(id);
  }
}
