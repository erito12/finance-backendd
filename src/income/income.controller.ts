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
  Logger,
} from "@nestjs/common";
import { IncomeService } from "./income.service";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { Income } from "../entities/income.entity";
import { IncomeFilterDto } from "./dto/income-filter.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("income")
export class IncomeController {
  private readonly logger = new Logger(IncomeController.name);
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "Lista de ingresos obtenida exitosamente",
    type: [Income],
  })
  @ApiResponse({ status: 404, description: "No se encontraron ingresos" })
  async getIncomes(@Query() filterDto: IncomeFilterDto): Promise<{
    data: Income[];
    meta: {
      totalItems: number;
      limit: number;
      page: number;
    };
  }> {
    return this.incomeService.findAll(filterDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const income = await this.incomeService.getById(id);
    if (!income) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return income;
  }

  @Get("available-years")
  @ApiOperation({
    summary: "Obtener años con datos disponibles",
    description:
      "Devuelve una lista de años únicos para los cuales existen registros de ingresos en la base de datos. Incluye automáticamente el año actual.",
  })
  @ApiResponse({
    status: 200,
    description: "Lista de años obtenida exitosamente",
    schema: {
      example: {
        success: true,
        message: "Años disponibles obtenidos",
        data: [2026, 2025, 2024, 2023],
        timestamp: "2026-01-28T12:00:00.000Z",
      },
    },
  })
  @ApiResponse({
    status: 500,
    description: "Error interno del servidor",
    schema: {
      example: {
        success: false,
        message: "Error al obtener años disponibles",
        error: "Error detail here",
        timestamp: "2026-01-28T12:00:00.000Z",
      },
    },
  })
  async getAvailableYears() {
    try {
      this.logger.log("📞 Solicitando años disponibles...");

      const years = await this.incomeService.getAvailableYears();

      this.logger.log(`✅ ${years.length} años obtenidos: ${years.join(", ")}`);

      return {
        success: true,
        message: "Años disponibles obtenidos",
        data: years,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error(
        `❌ Error en getAvailableYears: ${error.message}`,
        error.stack,
      );

      throw new HttpException(
        {
          success: false,
          message: "Error al obtener años disponibles",
          error:
            process.env.NODE_ENV === "development"
              ? error.message
              : "Error interno",
          timestamp: new Date().toISOString(),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
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
    const income = await this.incomeService.getById(id);
    if (!income) {
      throw new HttpException("No existe el ingreso", HttpStatus.NOT_FOUND);
    }
    return this.incomeService.removeById(id);
  }

  @Delete()
  async removeAll() {
    await this.incomeService.removeAll();

    // Como clear() no devuelve un objeto con "affected", puedes omitir esta verificación
    return {
      message: "Todos los ingresos han sido eliminados exitosamente.",
    };
  }
}
