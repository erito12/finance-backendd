import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Planning } from "src/entities/planning.entity";
import { Repository } from "typeorm";
import { CreatePlanningDto } from "./dto/create-planning.dto";

@Injectable()
export class PlanningService {
  constructor(
    @InjectRepository(Planning)
    private planningRepository: Repository<Planning>,
  ) {}

  async create(createPlanningDto: CreatePlanningDto): Promise<Planning> {
    if (!createPlanningDto.planning_name) {
      throw new BadRequestException(
        "El nombre de la planificación es requerido.",
        {
          cause: new Error(),
          description:
            "No se está pasando el parámetro de nombre de planificación",
        },
      );
    }
    if (!createPlanningDto.start_date || !createPlanningDto.end_date) {
      throw new BadRequestException(
        "La fecha de la planificación es requerida.",
        {
          cause: new Error(),
          description:
            "No se está pasando el parámetro de fecha de planificación",
        },
      );
    }
    const existingPlanning = await this.planningRepository.findOne({
      where: { planning_name: createPlanningDto.planning_name },
    });
    if (existingPlanning) {
      throw new BadRequestException(
        "Ya existe una planificación con el mismo nombre.",
        {
          cause: new Error(),
          description:
            "No se puede crear una nueva planificación con un nombre que ya existe",
        },
      );
    }
    const newPlanning = this.planningRepository.create(createPlanningDto);
    return this.planningRepository.save(newPlanning);
  }
}
