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
    //Comparando si la cuenta existe
    const accountExists = await this.accountService.getById(
      createExpenseDto.account_id,
    );
    if (!accountExists) {
      throw new BadRequestException(
        "La cuenta con el ID proporcionado no existe.",
      );
    }
    //validancion que los campos esten llenos
    if (!createExpenseDto.expense_amount) {
      throw new BadRequestException("La cantidad es requerida.");
    }
    if (!createExpenseDto.expense_details) {
      throw new BadRequestException("Los detalles son necesarios");
    }
    if (!createExpenseDto.expense_type) {
      throw new BadRequestException("El tipo de gasto es necesario");
    }

    // Comparar el monto del gasto con el saldo de la cuenta
    if (createExpenseDto.expense_amount > accountExists.account_amount) {
      throw new BadRequestException(
        "Esta acción no se puede realizar porque el gasto es mayor que el fondo.",
      );
    }
    //Crear Gasto
    const newExpense = this.expenseRepository.create({
      ...createExpenseDto,
      account: accountExists,
    });
    const saveExpense = await this.expenseRepository.save(newExpense);

    await this.accountService.updateAccountAmount(
      createExpenseDto.account_id,
      createExpenseDto.expense_amount,
      true,
    );

    return saveExpense;
  }

  async findAll(): Promise<Expense[]> {
    return this.expenseRepository.find({ relations: ["account"] });
  }

  async findById(expense_id: number): Promise<Expense | null> {
    return this.expenseRepository.findOne({
      where: { expense_id },
      relations: ["account"],
    });
  }

  async partialUpdate(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
  ): Promise<Expense | null> {
    const existingExpense = await this.findById(id);
    if (!existingExpense) return null;

    const accountId = existingExpense.account_id;

    if (
      updateExpenseDto.expense_amount &&
      updateExpenseDto.expense_amount !== existingExpense.expense_amount
    ) {
      const amountChange =
        updateExpenseDto.expense_amount - existingExpense.expense_amount;

      //Actualizar el monto de la cuenta
      await this.accountService.updateAccountAmount(
        accountId,
        Math.abs(amountChange),
        true,
      );
    }
    await this.expenseRepository.update(id, updateExpenseDto);
    return this.findById(id);
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
