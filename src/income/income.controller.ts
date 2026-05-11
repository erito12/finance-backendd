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
  NotFoundException,
} from "@nestjs/common";
import { IncomeService } from "./income.service";
import { UpdateIncomeDto } from "./dto/update-income.dto";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { IncomeEntity } from "../entities/income.entity";
import { IncomeFilterDto } from "./dto/income-filter.dto";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";

@Controller("income")
export class IncomeController {
  private readonly logger = new Logger(IncomeController.name);
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  @ApiOperation({ summary: "Crear un nuevo ingreso con distribución opcional" })
  @ApiResponse({
    status: 201,
    description: "Ingreso creado y saldos actualizados",
  })
  async create(@Body() createIncomeDto: CreateIncomeDto) {
    try {
      this.logger.log(
        `Creando nuevo ingreso por valor de: ${createIncomeDto.incomeAmount}`,
      );
      return await this.incomeService.create(createIncomeDto);
    } catch (error: any) {
      // Si el servicio lanza BadRequestException, NestJS lo manejará solo.
      // Pero si es un error inesperado, lo capturamos aquí.
      this.logger.error(`Error al crear ingreso: ${error.message}`);
      throw error;
    }
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "Lista de ingresos obtenida exitosamente",
    type: [IncomeEntity],
  })
  async getIncomes(@Query() filterDto: IncomeFilterDto) {
    // Nota: El servicio ya devuelve el objeto con data y meta
    return this.incomeService.findAll(filterDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const income = await this.incomeService.getById(id);
    if (!income) {
      throw new HttpException("Ingreso no encontrado", HttpStatus.NOT_FOUND);
    }
    return income;
  }

  @Get("available-years")
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
    } catch (error: unknown) {
      // 1. Cambiamos 'any' por 'unknown'

      // 2. Extraemos el mensaje de forma segura
      const errorMessage =
        error instanceof Error ? error.message : "Error desconocido";
      const errorStack = error instanceof Error ? error.stack : undefined;

      this.logger.error(
        `❌ Error en getAvailableYears: ${errorMessage}`,
        errorStack,
      );

      // 3. Verificamos el entorno de forma segura
      const isDevelopment = process.env.NODE_ENV === "development";

      throw new HttpException(
        {
          success: false,
          message: "Error al obtener años disponibles",
          error: isDevelopment ? errorMessage : "Error interno",
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
      throw new HttpException(
        "No se pudo encontrar el ingreso para actualizar",
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedIncome;
  }

  @Delete(":id")
  @ApiOperation({ summary: "Eliminar un ingreso y revertir saldos" })
  async removeById(@Param("id") id: number) {
    try {
      this.logger.log(`Solicitud para eliminar ingreso ID: ${id}`);
      // El servicio ahora maneja la reversión de saldos en la transacción
      await this.incomeService.removeById(id);

      return {
        success: true,
        message: `El ingreso ${id} y sus distribuciones han sido eliminados. Saldos revertidos.`,
      };
    } catch (error: any) {
      if (error instanceof NotFoundException) throw error;

      this.logger.error(`Error eliminando ingreso ${id}: ${error.message}`);
      throw new HttpException(
        "Error al procesar la eliminación del ingreso",
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete()
  @ApiOperation({
    summary: "Eliminar todos los ingresos (Cuidado: Acción Crítica)",
  })
  async removeAll() {
    this.logger.warn(
      "⚠️ Se ha solicitado la eliminación de TODOS los registros de ingresos.",
    );
    await this.incomeService.removeAll();

    return {
      success: true,
      message:
        "Todos los ingresos han sido eliminados y los saldos de cuenta actualizados.",
    };
  }
}
