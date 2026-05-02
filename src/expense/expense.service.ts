import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UpdateExpenseDto } from "./dto/update-expense.dto";
import { CreateExpenseDto } from "./dto/create-expense.dto";
import { ExpenseFilterDto } from "./dto/expense-filter.dto";
import { Expense } from "../entities/expense.entity";
import { AccountService } from "../account/account.service";
import { PurposeService } from "../purpose/purpose.service";

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    private accountService: AccountService,
    private purposeService: PurposeService,
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
    //validancion que los campos esten llenos
    if (!createExpenseDto.expense_amount) {
      throw new BadRequestException("La cantidad es requerida.");
    }
    if (!createExpenseDto.expense_details) {
      throw new BadRequestException("Los detalles son necesarios");
    }
    if (!createExpenseDto.expense_category) {
      throw new BadRequestException("El tipo de gasto es necesario");
    }

    // Comparar el monto del gasto con el saldo de la cuenta
    if (createExpenseDto.expense_amount > accountExists.totalBalance) {
      throw new BadRequestException(
        "Esta acción no se puede realizar porque el gasto es mayor que el fondo.",
      );
    }

    // 1. Validar que el propósito existe
    const purposeExists = await this.purposeService.getById(
      createExpenseDto.purpose_id,
    );
    if (!purposeExists) {
      throw new BadRequestException(
        "El propósito (fondo) seleccionado no existe.",
      );
    }

    // 2. (Opcional) Validar si hay saldo en ese propósito
    if (createExpenseDto.expense_amount > purposeExists.purpose_balance) {
      throw new BadRequestException(
        `Saldo insuficiente en el fondo: ${purposeExists.purpose_name}`,
      );
    }
    //Guardar Gasto
    const newExpense = this.expenseRepository.create({
      ...createExpenseDto,
      account: accountExists,
      purpose: purposeExists,
    });
    const saveExpense = await this.expenseRepository.save(newExpense);

    // 3. Actualizar cuenta física
    await this.accountService.updateAccountAmount(
      createExpenseDto.account_id,
      createExpenseDto.expense_amount,
      true,
    );

    // 4. NUEVO: Restar del balance del propósito
    await this.purposeService.updateBalance(
      createExpenseDto.purpose_id,
      -createExpenseDto.expense_amount, // Pasamos negativo para restar
    );

    return saveExpense;
  }

  async findAll(filterDto: ExpenseFilterDto): Promise<{
    data: Expense[];
    meta: {
      totalItems: number;
      limit: number;
      page: number;
    };
  }> {
    const { month, account_id, limit = 10, page = 1 } = filterDto;

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
    const totalItems = await queryBuilder.getCount();

    // Aplicar paginación
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      meta: {
        totalItems,
        limit,
        page,
      },
    };
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

    // 1. Manejar cambio de monto
    if (
      updateExpenseDto.expense_amount !== undefined &&
      updateExpenseDto.expense_amount !== existingExpense.expense_amount
    ) {
      const amountChange =
        updateExpenseDto.expense_amount - existingExpense.expense_amount;
      const isIncrease = amountChange > 0;

      // Actualizar Cuenta (Dinero real)
      await this.accountService.updateAccountAmount(
        existingExpense.account_id,
        Math.abs(amountChange),
        isIncrease, // Si el gasto aumentó, restamos de la cuenta (true)
      );

      // Actualizar Propósito (Dinero lógico)
      // Usamos el propósito que ya tiene el gasto (o el nuevo si se cambió)
      const targetPurposeId =
        updateExpenseDto.purpose_id || existingExpense.purpose_id;
      await this.purposeService.updateBalance(targetPurposeId, -amountChange);
    }

    // 2. Manejar cambio de propósito (Mover el gasto de una bolsa a otra)
    if (
      updateExpenseDto.purpose_id &&
      updateExpenseDto.purpose_id !== existingExpense.purpose_id
    ) {
      // Si NO cambió el monto, solo movemos el total del gasto entre propósitos
      if (
        updateExpenseDto.expense_amount === undefined ||
        updateExpenseDto.expense_amount === existingExpense.expense_amount
      ) {
        await this.purposeService.updateBalance(
          existingExpense.purpose_id,
          existingExpense.expense_amount,
        ); // Devolvemos al viejo
        await this.purposeService.updateBalance(
          updateExpenseDto.purpose_id,
          -existingExpense.expense_amount,
        ); // Restamos del nuevo
      }
    }

    await this.expenseRepository.update(id, updateExpenseDto);
    return this.findById(id);
  }

  async removeById(id: number): Promise<void> {
    const existingExpense = await this.findById(id);

    if (!existingExpense) {
      throw new BadRequestException("Ingreso no encontrado.");
    }

    if (!this.expenseRepository) {
      throw new BadRequestException("No existen datos que borrar");
    }

    const accountId = existingExpense.account_id;
    const expenseAmount = existingExpense.expense_amount;

    //Eliminar Ingreso

    await this.expenseRepository.delete(id);

    await this.accountService.updateAccountAmount(
      accountId,
      expenseAmount,
      false,
    );
  }

  async removeAll() {
    //Obtener todas los Gastos
    const allExpense = await this.expenseRepository.find();
    //Recorrer cada gastos y actualizar las cuentas correspondientes
    for (const expense of allExpense) {
      //Obtener el ID de la cuenta asociada gastos y monto
      const accountId = expense.account_id;
      const amount = expense.expense_amount;

      //Llamar a la funcion de Actualizar el monto de la cuenta
      await this.accountService.updateAccountAmount(accountId, amount, true);
    }
    // Eliminar todos los gastos
    await this.expenseRepository.clear();
  }
}
