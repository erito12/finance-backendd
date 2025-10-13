import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UpdateIncomeDto } from "./dto/update-income.dto";
import { Income } from "src/entities/income.entity";
import { AccountService } from "src/account/account.service";
import { CreateIncomeDto } from "./dto/create-income.dto";
import { IncomeFilterDto } from "./dto/income-filter.dto";

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
    private accountService: AccountService,
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    const accountExists = await this.accountService.getById(
      createIncomeDto.account_id,
    );
    if (!accountExists) {
      throw new BadRequestException(
        "La cuenta con el ID proporcionado no existe.",
      );
    }

    // Validaciones
    if (!createIncomeDto.income_amount) {
      throw new BadRequestException("La cantidad es requerida.");
    }
    if (!createIncomeDto.income_details) {
      throw new BadRequestException("Los detalles son necesarios.");
    }
    if (!createIncomeDto.income_type) {
      throw new BadRequestException("El tipo de ingreso es necesario.");
    }

    // Crear el ingreso
    const newIncome = this.incomeRepository.create({
      ...createIncomeDto,
      account: accountExists, // Establecer la relación aquí
    });
    const saveIncome = await this.incomeRepository.save(newIncome);

    await this.accountService.updateAccountAmount(
      createIncomeDto.account_id,
      createIncomeDto.income_amount,
      false,
    );

    return this.incomeRepository.save(saveIncome);
  }

  async findAll(filterDto: IncomeFilterDto): Promise<{
    data: Income[];
    meta: {
      totalItems: number;
      limit: number;
      page: number;
    };
  }> {
    const { month, account_id, limit = 10, page = 1 } = filterDto;

    const queryBuilder = this.incomeRepository
      .createQueryBuilder("income")
      .leftJoinAndSelect("income.account", "account");

    // Filtrar por mes
    if (month) {
      const startDate = new Date(new Date().getFullYear(), month - 1, 1); // Primer día del mes
      const endDate = new Date(new Date().getFullYear(), month, 0); // Último día del mes
      queryBuilder.where(
        "income.income_date >= :startDate AND income.income_date <= :endDate",
        {
          startDate,
          endDate,
        },
      );
    }

    //Filtrar por id
    if (account_id) {
      queryBuilder.andWhere("income.account_id = :account_id", { account_id });
    }

    // Contar el total de registros
    const totalItems = await queryBuilder.getCount();

    // Aplicar paginación
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .select(["income", "account.account_type"])
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

  async findById(income_id: number): Promise<Income | null> {
    return this.incomeRepository.findOne({
      where: { income_id },
      relations: ["account"],
    });
  }

  async partialUpdate(
    id: number,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<Income | null> {
    const existingIncome = await this.findById(id);

    if (!existingIncome) return null;

    const accountId = existingIncome.account_id;
    if (
      updateIncomeDto.income_amount &&
      updateIncomeDto.income_amount !== existingIncome.income_amount
    ) {
      const amountChange =
        updateIncomeDto.income_amount + existingIncome.income_amount;

      await this.accountService.updateAccountAmount(
        accountId,
        Math.abs(amountChange),
        false,
      );
    }

    await this.incomeRepository.update(id, updateIncomeDto);
    return this.findById(id);
  }

  async removeById(id: number): Promise<void> {
    const existingIncome = await this.findById(id);

    if (!existingIncome) {
      throw new BadRequestException("Ingreso no encontrado.");
    }
    if (!this.incomeRepository) {
      throw new BadRequestException("No existen datos que borrar");
    }

    const accountId = existingIncome.account_id;
    const incomeAmount = existingIncome.income_amount;

    //Eliminar ingreso
    await this.incomeRepository.delete(id);
    //Actualizar monto dela cuenta

    await this.accountService.updateAccountAmount(
      accountId,
      incomeAmount,
      true,
    );
  }

  async removeAll() {
    //Obtener todas los Ingresos
    const allIncomes = await this.incomeRepository.find();
    //Recorrer cada ingreso y actualizar las cuentas correspondientes
    for (const income of allIncomes) {
      //Obtener el ID de la cuenta asociada ingreso y monto
      const accountId = income.account_id;
      const amount = income.income_amount;

      //Llamar a la funcion de Actualizar el monto de la cuenta
      await this.accountService.updateAccountAmount(accountId, amount, true);
    }
    // Eliminar todos los ingresos
    await this.incomeRepository.clear();
  }
}
