import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  HttpException,
  HttpStatus,
  Query,
} from "@nestjs/common";
import { IncomeService } from "./income.service";
import { UpdateIncomeDto } from "./dto/income.dto";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { Income } from "src/entities/income.entity";
import { IncomeFilterDto } from "./dto/income-filter.dto";
import { ApiResponse } from "@nestjs/swagger";

@Controller("income")
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }

  // @Get()
  // @ApiQuery({
  //   name: "month",
  //   required: false,
  //   description: "Mes para filtrar ingresos",
  // })
  // @ApiQuery({
  //   name: "accountId",
  //   required: false,
  //   description: "ID de la cuenta para filtrar ingresos",
  // })
  // @ApiQuery({
  //   name: "page",
  //   required: false,
  //   description: "Número de página para paginación",
  // })
  // @ApiQuery({
  //   name: "limit",
  //   required: false,
  //   description: "Número de resultados por página",
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: "Lista de ingresos obtenida exitosamente",
  //   type: [Income],
  // })
  // @ApiResponse({ status: 404, description: "No se encontraron ingresos" })
  // async getIncomes(
  //   @Query() filterDto: IncomeFilterDto,
  // ): Promise<{ data: Income[]; total: number; page: number; limit: number }> {
  //   return this.incomeService.findAll(filterDto);
  // }
  @Get()
  @ApiResponse({
    status: 200,
    description: "Lista de ingresos obtenida exitosamente",
    type: [Income],
  })
  @ApiResponse({ status: 404, description: "No se encontraron ingresos" })
  async getIncomes(
    @Query() filterDto: IncomeFilterDto,
  ): Promise<{ data: Income[]; total: number; page: number; limit: number }> {
    return this.incomeService.findAll(filterDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const income = await this.incomeService.findById(id);
    if (!income) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return income;
  }

  @Put(":id")
  async update(
    @Param("id") id: number,
    @Body() updateIncomeDto: UpdateIncomeDto,
  ) {
    const updatedIncome = await this.incomeService.partialUpdate(
      id,
      updateIncomeDto,
    );
    if (!updatedIncome) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return updatedIncome;
  }

  @Delete(":id")
  async removeById(@Param("id") id: number) {
    const income = await this.incomeService.findById(id);
    if (!income) {
      throw new HttpException("No existe el ingreso", HttpStatus.NOT_FOUND);
    }
    return this.incomeService.removeById(id);
  }

  @Delete()
  async removeAll() {
    const result = await this.incomeService.removeAll();

    // Verificar si se han eliminado ingresos
    if (result.affected === 0) {
      throw new HttpException(
        "No hay ingresos para eliminar",
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: `${result.affected} ingresos eliminados exitosamente.`,
    };
  }
}
