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
} from "@nestjs/common";
import { IncomeService } from "./income.service";
import { CreateIncomeDto, UpdateIncomeDto } from "./dto/income.dto";

@Controller("income")
export class IncomeController {
  constructor(private readonly incomeService: IncomeService) {}

  @Post()
  async create(@Body() createIncomeDto: CreateIncomeDto) {
    return this.incomeService.create(createIncomeDto);
  }

  @Get()
  async findAll() {
    return this.incomeService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const income = await this.incomeService.findOne(id);
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
    const updatedIncome = await this.incomeService.update(id, updateIncomeDto);
    if (!updatedIncome) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return updatedIncome;
  }

  @Delete(":id")
  async remove(@Param("id") id: number) {
    const income = await this.incomeService.findOne(id);
    if (!income) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return this.incomeService.remove(id);
  }
}
