import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  // Put,
} from "@nestjs/common";
import { IncomePlanningService } from "./planned-income.service";
import { CreateIncomePlanningDto } from "./dto/create-planning-income.dto";
// import { ApiResponse } from "@nestjs/swagger";
// import { IncomePlanning } from "../entities/planning-income.entity";
// import { UpdateIncomePlanningDto } from "./dto/update-planning-income.dto";

@Controller("planning-income")
export class PlanningIncomeController {
  constructor(private readonly incomePlanningService: IncomePlanningService) {}

  @Post()
  async create(@Body() createIncomePlanningDto: CreateIncomePlanningDto) {
    return this.incomePlanningService.create(createIncomePlanningDto);
  }

  @Get()
  async getAll() {
    return this.incomePlanningService.getAll();
  }

  @Get(":id")
  async getById(@Param("id") id: number) {
    const incomeplaning = await this.incomePlanningService.getById(id);

    if (!incomeplaning) {
      throw new BadRequestException("Planificacion de Ingreso no encontrada");
    }
    return incomeplaning;
  }

  // @Put(":id")
  // async updateById(
  //   @Param("id") id: number,
  //   @Body() updateIncomePlanning: UpdateIncomePlanningDto,
  // ) {
  //   const updateAccountAmount = await this.incomePlanningService.
  // }

  @Delete(":id")
  async removeById(@Param("id") id: number) {
    const incomePlanning = await this.incomePlanningService.getById(id);

    if (!incomePlanning) {
      throw new BadRequestException("La planificacion del ingreso no existe ");
    }
    return this.incomePlanningService.removeById(id);
  }

  @Delete()
  async removeAll() {
    return this.incomePlanningService.removeAll();
  }
}
