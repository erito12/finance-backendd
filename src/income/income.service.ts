import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UpdateIncomeDto } from "./dto/update-income.dto";

import { CreateIncomeDto } from "./dto/create-income.dto";
import { IncomeFilterDto } from "./dto/income-filter.dto";
import { Income } from "../entities/income.entity";
import { AccountService } from "../account/account.service";
import { PurposeService } from "../purpose/purpose.service";

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
    private accountService: AccountService,
    private purposeService: PurposeService,
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    const accountExists = await this.accountService.getById(
      createIncomeDto.accountId,
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
      account: accountExists,
    });

    const saveIncome = await this.incomeRepository.save(newIncome);

    await this.accountService.updateAccountAmount(
      createIncomeDto.accountId,
      createIncomeDto.income_amount,
      false,
    );

    // 2. NUEVO: Distribuir en los propósitos
    await this.purposeService.distributeIncome(createIncomeDto.income_amount);

    return this.incomeRepository.save(saveIncome);
  }

  async findAll(filterDto: IncomeFilterDto): Promise<{
    data: Income[];
    meta: {
      totalItems: number;
      limit: number;
      page: number;
      availableYears: number[];
    };
  }> {
    const { month, accountId, year, limit = 10, page = 1 } = filterDto;

    // Obtener años disponibles
    const availableYears = await this.getAvailableYears();
    const currentYear = new Date().getFullYear();

    // Validar que el año solicitado tenga datos
    let filterYear = year || currentYear.toString();
    const yearNumber = parseInt(filterYear);

    // Si el año solicitado no tiene datos, usar el año más reciente disponible
    if (!availableYears.includes(yearNumber)) {
      filterYear = availableYears[0]?.toString() || currentYear.toString();
    }

    const queryBuilder = this.incomeRepository
      .createQueryBuilder("income")
      .leftJoinAndSelect("income.account", "account");

    // FILTRAR POR AÑO (solo si se especifica un año)
    if (year && year !== "") {
      const startDate = new Date(parseInt(year), 0, 1);
      const endDate = new Date(parseInt(year), 11, 31);
      queryBuilder.where(
        "income.income_date >= :startDate AND income.income_date <= :endDate",
        { startDate, endDate },
      );
    } else {
      // Si no se especifica año, mostrar solo el año actual
      const currentYear = new Date().getFullYear();
      const startDate = new Date(currentYear, 0, 1);
      const endDate = new Date(currentYear, 11, 31);
      queryBuilder.where(
        "income.income_date >= :startDate AND income.income_date <= :endDate",
        { startDate, endDate },
      );
    }
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
    if (accountId) {
      queryBuilder.andWhere("income.accountId = :accountId", { accountId });
    }
    // Contar el total de registros
    const totalItems = await queryBuilder.getCount();

    // Aplicar paginación
    const data = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .select([
        "income",
        "account.accountId",
        "account.accountName",
        "account.storageType",
        "account.initialBalance",
        "account.totalBalance",
      ])

      .getMany();

    return {
      data,
      meta: {
        totalItems,
        availableYears,
        limit,
        page,
      },
    };
  }

  async getById(income_id: number): Promise<Income | null> {
    return this.incomeRepository.findOne({
      where: { income_id },
      relations: ["account"],
    });
  }

  async partialUpdate(
    id: number,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<Income | null> {
    const existingIncome = await this.getById(id);
    if (!existingIncome) return null;

    if (
      updateIncomeDto.income_amount !== undefined &&
      updateIncomeDto.income_amount !== existingIncome.income_amount
    ) {
      const amountChange =
        updateIncomeDto.income_amount - existingIncome.income_amount;

      // 1. Actualizar Cuenta Física
      await this.accountService.updateAccountAmount(
        existingIncome.accountId,
        Math.abs(amountChange),
        amountChange < 0, // Si el cambio es negativo (el ingreso bajó), restamos de la cuenta
      );

      // 2. Redistribuir la diferencia en los propósitos
      // Si ganaste $100 más, repartimos esos $100 según los %
      await this.purposeService.distributeIncome(amountChange);
    }

    await this.incomeRepository.update(id, updateIncomeDto);
    return this.getById(id);
  }

  async removeById(id: number): Promise<void> {
    const existingIncome = await this.getById(id);

    if (!existingIncome) {
      throw new BadRequestException("Ingreso no encontrado.");
    }

    const accountId = existingIncome.accountId;
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
      const accountId = income.accountId;
      const amount = income.income_amount;

      //Llamar a la funcion de Actualizar el monto de la cuenta
      await this.accountService.updateAccountAmount(accountId, amount, true);
    }

    // Eliminar todos los ingresos
    await this.incomeRepository.clear();
  }

  // Meotodos alternativos

  //obtener años con datos disponibles
  async getAvailableYears(): Promise<number[]> {
    const result = await this.incomeRepository
      .createQueryBuilder("income")
      .select(`DISTINCT EXTRACT(YEAR FROM income.income_date) as year`)
      .orderBy("year", "DESC")
      .getRawMany();

    // Formatear resultado
    const years = result
      .map((item) => parseInt(item.year))
      .filter((year) => !isNaN(year) && year > 0);

    // Asegurarse de que el año actual esté incluido
    const currentYear = new Date().getFullYear();
    if (years.length > 0 && !years.includes(currentYear)) {
      years.unshift(currentYear);
    } else if (years.length === 0) {
      years.push(currentYear);
    }

    return years;
  }
}
