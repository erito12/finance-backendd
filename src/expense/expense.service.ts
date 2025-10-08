import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Expense } from "src/entities/expense.entity";
import { AccountService } from "src/account/account.service";
import { CreateExpenseDto, UpdateExpenseDto } from "./dto/expense.dto";

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    private accountService: AccountService,
  ) {}

  async create(createExpenseDto: CreateExpenseDto): Promise<Expense> {
    const accountExists = await this.accountService.getById(
      createExpenseDto.account_id,
    );

    if (!accountExists) {
      throw new BadRequestException(
        "La cuenta con el ID proporcionado no existe.",
      );
    }
    if (!createExpenseDto.expense_amount) {
      throw new BadRequestException("La cantidad es requerida.");
    } else if (!createExpenseDto.expense_details) {
      throw new BadRequestException("Los detalles son necesarios");
    } else if (!createExpenseDto.expense_type) {
      throw new BadRequestException("El tipo de gasto es necesario");
    }
    const newIngreso = this.expenseRepository.create(createExpenseDto);
    return this.expenseRepository.save(newIngreso);
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({ relations: ["account"] });
  }

  async findOne(expense_id: number): Promise<Expense | null> {
    return this.expenseRepository.findOne({
      where: { expense_id },
      relations: ["account"],
    });
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense | null> {
    const existingExpense = await this.findOne(id);
    if (!existingExpense) {
      return null;
    }
    await this.expenseRepository.update(id, updateExpenseDto);
    return this.findOne(id);
  }

  async removeById(id: number): Promise<void> {
    if (!this.expenseRepository) {
      throw new BadRequestException("No existen datos que borrar");
    } else await this.expenseRepository.delete(id);
  }

  async removeAll(): Promise<void> {
    await this.expenseRepository.deleteAll();
  }
}
