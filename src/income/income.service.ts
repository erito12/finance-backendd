import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { DataSource, Repository } from "typeorm";

import { UpdateIncomeDto } from "./dto/update-income.dto";

import { CreateIncomeDto } from "./dto/create-income.dto";
import { IncomeFilterDto } from "./dto/income-filter.dto";
import { IncomeEntity } from "../entities/income.entity";
import { AccountService } from "../account/account.service";
import { PurposeService } from "../purpose/purpose.service";
import { PurposeEntity } from "../entities/purpose.entity";
import { IncomeDistributionEntity } from "../entities/income-distribution.entity";

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(IncomeEntity)
    private incomeRepository: Repository<IncomeEntity>,
    private accountService: AccountService,
    private purposeService: PurposeService,
    private dataSource: DataSource,
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<IncomeEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const accountExists = await this.accountService.getById(
        createIncomeDto.accountId,
      );
      if (!accountExists) {
        throw new BadRequestException("La cuenta no existe.");
      }

      const allocationMode = createIncomeDto.allocationMode ?? "percentage";
      const totalIncome = Number(createIncomeDto.incomeAmount);

      if (!Number.isFinite(totalIncome) || totalIncome <= 0) {
        throw new BadRequestException("El monto del ingreso debe ser válido.");
      }

      const newIncome = queryRunner.manager.create(IncomeEntity, {
        incomeAmount: totalIncome,
        incomeDetail: createIncomeDto.incomeDetails,
        incomeType: createIncomeDto.incomeType,
        account: accountExists,
      });

      const savedIncome = await queryRunner.manager.save(newIncome);

      const effectiveDistributions = createIncomeDto.distributions?.length
        ? createIncomeDto.distributions
        : createIncomeDto.usePurposeDefaults
          ? await this.getDefaultPurposeDistributions()
          : [];

      if (effectiveDistributions.length) {
        let totalAssigned = 0;

        for (const dist of effectiveDistributions) {
          const purposeId = Number(dist.purposeId);
          if (!purposeId) {
            throw new BadRequestException(
              "Cada distribución requiere un purposeId válido.",
            );
          }

          const purpose = await queryRunner.manager.findOne(PurposeEntity, {
            where: { purposeId },
          });

          if (!purpose) {
            throw new BadRequestException(
              `Propósito con ID ${purposeId} no existe.`,
            );
          }

          if (allocationMode === "percentage") {
            const percentage = Number(dist.percentage);

            if (!Number.isFinite(percentage) || percentage <= 0) {
              throw new BadRequestException(
                `El porcentaje del propósito ${purposeId} es inválido.`,
              );
            }

            if (percentage > 100) {
              throw new BadRequestException(
                `El porcentaje del propósito ${purposeId} no puede superar 100%.`,
              );
            }

            totalAssigned += percentage;

            const amountToDistribute = (totalIncome * percentage) / 100;
            const distribution = queryRunner.manager.create(
              IncomeDistributionEntity,
              {
                income: savedIncome,
                incomeId: savedIncome.incomeId,
                purpose,
                purposeId: purpose.purposeId,
                amount: amountToDistribute,
                percentage,
              },
            );

            await queryRunner.manager.save(distribution);
            await queryRunner.manager.increment(
              PurposeEntity,
              { purposeId: purpose.purposeId },
              "purposeBalance",
              amountToDistribute,
            );
          } else {
            const fixedAmount = Number(dist.amount);

            if (!Number.isFinite(fixedAmount) || fixedAmount < 0) {
              throw new BadRequestException(
                `El monto fijo del propósito ${purposeId} es inválido.`,
              );
            }

            totalAssigned += fixedAmount;

            const percentageValue =
              totalIncome > 0 ? (fixedAmount / totalIncome) * 100 : 0;

            const distribution = queryRunner.manager.create(
              IncomeDistributionEntity,
              {
                income: savedIncome,
                incomeId: savedIncome.incomeId,
                purpose,
                purposeId: purpose.purposeId,
                amount: fixedAmount,
                percentage: percentageValue,
              },
            );

            await queryRunner.manager.save(distribution);
            await queryRunner.manager.increment(
              PurposeEntity,
              { purposeId: purpose.purposeId },
              "purposeBalance",
              fixedAmount,
            );
          }
        }

        if (allocationMode === "percentage" && totalAssigned > 100) {
          throw new BadRequestException(
            "La suma de porcentajes asignados no puede superar el 100%.",
          );
        }

        if (allocationMode === "fixed" && totalAssigned > totalIncome) {
          throw new BadRequestException(
            "La suma de los montos asignados no puede superar el ingreso total.",
          );
        }
      }

      await this.accountService.updateAccountAmount(
        createIncomeDto.accountId,
        createIncomeDto.incomeAmount,
        false,
      );

      await queryRunner.commitTransaction();

      return savedIncome;
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      if (err instanceof BadRequestException) throw err;
      const message = err instanceof Error ? err.message : "Error desconocido";
      throw new BadRequestException(`No se pudo crear el ingreso: ${message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private async getDefaultPurposeDistributions(): Promise<
    Array<{ purposeId: number; percentage?: number; amount?: number }>
  > {
    const purposes = await this.purposeService.findAll();

    return purposes
      .filter(
        (purpose) =>
          purpose.defaultAllocationType &&
          purpose.defaultAllocationValue !== null &&
          purpose.defaultAllocationValue !== undefined,
      )
      .map((purpose) => ({
        purposeId: purpose.purposeId,
        ...(purpose.defaultAllocationType === "percentage"
          ? { percentage: Number(purpose.defaultAllocationValue) }
          : { amount: Number(purpose.defaultAllocationValue) }),
      }));
  }

  async findAll(filterDto: IncomeFilterDto): Promise<{
    data: IncomeEntity[];
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

  async getById(incomeId: number): Promise<IncomeEntity | null> {
    return this.incomeRepository.findOne({
      where: { incomeId },
      relations: ["account"],
    });
  }

  async partialUpdate(
    id: number,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<IncomeEntity | null> {
    const existingIncome = await this.getById(id);
    if (!existingIncome) return null;

    if (
      updateIncomeDto.incomeAmount !== undefined &&
      updateIncomeDto.incomeAmount !== existingIncome.incomeAmount
    ) {
      const amountChange =
        updateIncomeDto.incomeAmount - existingIncome.incomeAmount;

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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Buscar el ingreso con sus distribuciones
      const income = await queryRunner.manager.findOne(IncomeEntity, {
        where: { incomeId: id },
        relations: ["distributions", "distributions.purpose"],
      });

      if (!income) {
        throw new NotFoundException(`El ingreso con ID ${id} no existe.`);
      }

      // 2. Revertir saldos en los Propósitos
      if (income.distributions && income.distributions.length > 0) {
        for (const dist of income.distributions) {
          if (!dist.purpose || dist.purposeId == null) {
            continue;
          }

          const pId = dist.purpose.purposeId;
          const amountToSubtract = Number(dist.amount ?? 0);

          await queryRunner.manager.decrement(
            PurposeEntity,
            { purposeId: pId },
            "purposeBalance",
            amountToSubtract,
          );
        }
      }

      // 3. Revertir saldo en la Cuenta
      await this.accountService.updateAccountAmount(
        income.accountId,
        income.incomeAmount,
        true,
      );

      // 4. Eliminar el ingreso
      await queryRunner.manager.remove(income);

      await queryRunner.commitTransaction();
    } catch (err: unknown) {
      await queryRunner.rollbackTransaction();
      if (err instanceof NotFoundException) throw err;
      const message = err instanceof Error ? err.message : "Error desconocido";
      throw new BadRequestException(
        `No se pudo eliminar el ingreso: ${message}`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  async removeAll() {
    //Obtener todas los Ingresos
    const allIncomes = await this.incomeRepository.find();
    //Recorrer cada ingreso y actualizar las cuentas correspondientes
    for (const income of allIncomes) {
      //Obtener el ID de la cuenta asociada ingreso y monto
      const accountId = income.accountId;
      const amount = income.incomeAmount;

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
