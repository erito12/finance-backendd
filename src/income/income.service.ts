import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UpdateIncomeDto } from "./dto/income.dto";
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

  async findAll(
    filterDto: IncomeFilterDto,
  ): Promise<{ data: Income[]; total: number; page: number; limit: number }> {
    const { month, account_id, page = 1, limit = 10 } = filterDto;

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
    const total = await queryBuilder.getCount();

    // Aplicar paginación
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return {
      data,
      total,
      page,
      limit,
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
    if (!this.incomeRepository) {
      throw new BadRequestException("No existen datos que borrar");
    } else await this.incomeRepository.delete(id);
  }

  async removeAll() {
    // Devuelve el resultado de la operación de eliminación
    return await this.incomeRepository.delete({});
  }
}
