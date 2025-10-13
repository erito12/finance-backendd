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
  Query,
} from "@nestjs/common";

import { ExpenseService } from "./expense.service";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpenseFilterDto } from "./dto/expense-filter.dto";
import { Expense } from "src/entities/expense.entity";
import { ApiResponse } from "@nestjs/swagger";

@Controller("expense")
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  @ApiResponse({
    status: 200,
    description: "Lista de gastos obtenida exitosamente",
    type: [Expense],
  })
  @ApiResponse({ status: 404, description: "No se encontraron gastos" })
  async findAllExpense(@Query() filterDto: ExpenseFilterDto): Promise<{
    data: Expense[];
    meta: {
      totalItems: number;
      limit: number;
      page: number;
    };
  }> {
    return this.expenseService.findAll(filterDto);
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const expense = await this.expenseService.findById(id);
    if (!expense) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return expense;
  }

  @Put(":id")
  async partialUpdate(
    @Param("id") id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const updatedExpense = await this.expenseService.partialUpdate(
      id,
      updateExpenseDto,
    );
    if (!updatedExpense) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return updatedExpense;
  }

  @Delete(":id")
  async removeById(@Param("id") id: number) {
    const expense = await this.expenseService.findById(id);
    if (!expense) {
      throw new HttpException("No existe el gasto", HttpStatus.NOT_FOUND);
    }
    return this.expenseService.removeById(id);
  }

  @Delete()
  async removeAll() {
    await this.expenseService.removeAll();
    return {
      message: "Todos los gastos han sido eliminados exitosamente.",
    };
  }
}
