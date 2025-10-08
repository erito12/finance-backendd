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
import { ExpenseService } from "./expense.service";
import { CreateExpenseDto, UpdateExpenseDto } from "./dto/expense.dto";

@Controller("expense")
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto) {
    return this.expenseService.create(createExpenseDto);
  }

  @Get()
  async findAll() {
    return this.expenseService.findAll();
  }

  @Get(":id")
  async findOne(@Param("id") id: number) {
    const expense = await this.expenseService.findOne(id);
    if (!expense) {
      throw new HttpException("Income not found", HttpStatus.NOT_FOUND);
    }
    return expense;
  }

  @Put(":id")
  async update(
    @Param("id") id: number,
    @Body() updateExpenseDto: UpdateExpenseDto,
  ) {
    const updatedExpense = await this.expenseService.update(
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
    const expense = await this.expenseService.findOne(id);
    if (!expense) {
      throw new HttpException("No existe el gasto", HttpStatus.NOT_FOUND);
    }
    return this.expenseService.removeById(id);
  }

  @Delete()
  async removeAll() {
    const account = await this.expenseService.findAll();
    if (!account) {
      throw new HttpException("No existe el gasto", HttpStatus.NOT_FOUND);
    }
    return this.expenseService.removeAll();
  }
}
