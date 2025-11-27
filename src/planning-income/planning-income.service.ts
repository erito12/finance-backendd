import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { IncomePlanning } from "../entities/planning-income.entity";
import { Repository } from "typeorm";
import { PlanningService } from "../planning/planning.service";
import { CreatePlanningIncomeDto } from "./dto/create-planning-income.dto";

@Injectable()
export class PlanningIncomeService {
  constructor(
    @InjectRepository(IncomePlanning)
    private planningIncomeRepository: Repository<IncomePlanning>,
    private planningService: PlanningService,
  ) {}

  async create(
    createPlanningIncomeDto: CreatePlanningIncomeDto,
  ): Promise<IncomePlanning> {
    const existingPlanning = await this.planningService.getById(
      createPlanningIncomeDto.planning_id,
    );
    const existNameIncomePlanning = await this.planningIncomeRepository.findOne(
      {
        where: {
          income_planning_type: createPlanningIncomeDto.income_planning_type,
        },
      },
    );
    if (existNameIncomePlanning) {
      throw new BadRequestException(
        "Ya existe una planificación de ingreso con el mismo nombre.",
        {
          cause: new Error(),
          description:
            "No se puede crear una nueva planificación de ingreso con un nombre existente",
        },
      );
    }

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

  async getById(income_planning_id: number): Promise<IncomePlanning | null> {
    return this.planningIncomeRepository.findOneBy({ income_planning_id });
  }

  async getAll(): Promise<IncomePlanning[]> {
    return this.planningIncomeRepository.find();
  }
}
