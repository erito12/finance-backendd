import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";

import { PlanningService } from "./planning.service";
import { CreatePlanningDto } from "./dto/create-planning.dto";
import { UpdatePlanningDto } from "./dto/update-planning.dto";

@Controller("planning")
export class PlanningController {
  constructor(private readonly planningService: PlanningService) {}
  @Post()
  async create(@Body() createPlanningDto: CreatePlanningDto) {
    return this.planningService.create(createPlanningDto);
  }
  @Get()
  async findAll() {
    return this.planningService.getAll();
  }
  @Get(":id")
  async getById(@Param("id") id: number) {
    const planning = await this.planningService.getById(id);

    if (!planning) {
      throw new HttpException("Cuenta no encontrada", HttpStatus.NOT_FOUND);
    }
    return planning;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: number,
    @Body() updatePlanningDto: UpdatePlanningDto,
  ) {
    const updatePlanning = await this.planningService.partialUpdate(
      id,
      updatePlanningDto,
    );
    if (!updatePlanning) {
      throw new HttpException(
        "No esta funcionadndo actualizar cuenta",
        HttpStatus.NOT_FOUND,
      );
    }
    return updatePlanning;
  }

  @Delete()
  async removeAll() {
    return this.planningService.removeAll();
  }

  @Delete(":id")
  async removeById(@Param("id") id: number) {
    const planning = await this.planningService.getById(id);
    if (!planning) {
      throw new HttpException("La cuenta no existe", HttpStatus.NOT_FOUND);
    }
    return this.planningService.removeById(id);
  }
}
