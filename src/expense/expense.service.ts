import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { Expense } from "src/entities/expense.entity";
import { AccountService } from "src/account/account.service";
import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpenseFilterDto } from "./dto/expense-filter.dto";

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

  async findAll(
    filterDto: ExpenseFilterDto,
  ): Promise<{ data: Expense[]; total: number; limit: number; page: number }> {
    const { month, account_id, page = 1, limit = 10 } = filterDto;

    const queryBuilder = this.expenseRepository
      .createQueryBuilder("expense")
      .leftJoinAndSelect("expense.account", "account"); // Cambiado aquí

    //Filtrar por Meses
    if (month) {
      const startDate = new Date(new Date().getFullYear(), month - 1, 1); // Primer día del mes
      const endDate = new Date(new Date().getFullYear(), month, 0); // Último día del mes

      queryBuilder.where(
        "expense.expense_date >= :startDate AND expense.expense_date <= :endDate",
        {
          startDate,
          endDate,
        },
      );
    }

    //Filtrar por id
    if (account_id) {
      queryBuilder.andWhere("expense.account_id = :account_id", { account_id });
    }

    // Contar el total de registros
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { data, total, limit, page };
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

  async removeAll() {
    return await this.expenseRepository.delete({});
  }
}
