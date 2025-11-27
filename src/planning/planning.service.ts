import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";
import { CreatePlanningDto } from "./dto/create-planning.dto";
import { Planning } from "../entities/planning.entity";
import { UpdatePlanningDto } from "./dto/update-planning.dto";

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
            "No se puede crear una nueva planificación con un nombre existente",
        },
      );
    }
    const newPlanning = this.planningRepository.create(createPlanningDto);
    return this.planningRepository.save(newPlanning);
  }

  async getById(planning_id: number): Promise<Planning | null> {
    return this.planningRepository.findOneBy({ planning_id });
  }

  async getIdByName(planning_name: string): Promise<Planning | null> {
    const normalizedPlanningName = planning_name.trim().toLowerCase(); // Eliminar espacios y convertir a minúsculas
    return this.planningRepository.findOneBy({
      planning_name: normalizedPlanningName,
    });
  }

  async getAll(): Promise<Planning[]> {
    return this.planningRepository.find();
  }

  async partialUpdate(
    id: number,
    updatePlanningDto: UpdatePlanningDto,
  ): Promise<Planning | null> {
    const existingPlanning = await this.getById(id);
    if (!existingPlanning) {
      throw new BadRequestException("No existe la cuenta a actualizar");
    }
    await this.planningRepository.update(id, updatePlanningDto);
    return this.getById(id);
  }

  async removeAll(): Promise<void> {
    const count = await this.planningRepository.count();

    if (count === 0) {
      throw new BadRequestException("No hay datos que borrar");
    }

    await this.planningRepository.deleteAll();
  }

  async removeById(id: number): Promise<void> {
    const count = await this.planningRepository.count();

    if (count === 0) {
      throw new BadRequestException("No hay datos que borrar");
    }
    await this.planningRepository.delete(id);
  }

  //Metodos Complementarios
}
