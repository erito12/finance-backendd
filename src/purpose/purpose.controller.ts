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
import { PurposeService } from "./purpose.service";
import { CreatePurposeDto } from "./dto/create-purpose.dto";
import { UpdatePurposeDto } from "./dto/update-purpose.dto";
import { ExchangeMoneyDto } from "../common/dto/ExchangeMoney.dto";
import { PurposeEntity } from "../entities/purpose.entity";

@Controller("purpose")
export class PurposeController {
  constructor(private readonly purposeService: PurposeService) {}

  @Post()
  async create(@Body() createPurposeDto: CreatePurposeDto) {
    return this.purposeService.create(createPurposeDto);
  }
  @Get()
  async findAll() {
    return this.purposeService.findAll();
  }

  @Get("id")
  async getById(@Param("id") id: number) {
    const purpose = await this.purposeService.getById(id);

    if (!purpose) {
      throw new HttpException(
        "Presupuesto no encontrado",
        HttpStatus.NOT_FOUND,
      );
    }
    return purpose;
  }

  @Put(":id")
  async updateById(
    @Param("id") id: number,
    @Body() updatePurposeDto: UpdatePurposeDto,
  ) {
    const updatePurpose = await this.purposeService.partialUpdate(
      id,
      updatePurposeDto,
    );
    if (!updatePurpose) {
      throw new HttpException(
        "No esta funcionadndo actualizar el presupuesto",
        HttpStatus.NOT_FOUND,
      );
    }

    return updatePurpose;
  }

  @Delete(":id")
  async removeById(@Param("id") id: number) {
    const purpose = await this.purposeService.getById(id);
    if (!purpose) {
      throw new HttpException("El presupuesto no existe", HttpStatus.NOT_FOUND);
    }

    return this.purposeService.removeById(id);
  }

  // Método para intercambiar dinero entre cuentas
  @Put("exchange/:sourceId/:targetId")
  async exchangeMoney(
    @Param("sourceId") sourceId: number,
    @Param("targetId") targetId: number,
    @Body() exchangeMoneyDto: ExchangeMoneyDto,
  ): Promise<{ source: PurposeEntity; target: PurposeEntity }> {
    return this.purposeService.exchangeMoneyPurpose(
      sourceId,
      targetId,
      exchangeMoneyDto.amount,
    );
  }
}
