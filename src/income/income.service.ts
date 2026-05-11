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
      // 1. Validar Cuenta
      const accountExists = await this.accountService.getById(
        createIncomeDto.accountId,
      );
      if (!accountExists) {
        throw new BadRequestException("La cuenta no existe.");
      }

      // 2. Crear el objeto Ingreso
      const newIncome = queryRunner.manager.create(IncomeEntity, {
        incomeAmount: createIncomeDto.incomeAmount,
        incomeDetail: createIncomeDto.incomeDetails,
        incomeType: createIncomeDto.income_type,
        accountId: createIncomeDto.accountId,
      });

      const savedIncome = await queryRunner.manager.save(newIncome);

      // 3. Procesar Distribución Dinámica
      if (
        createIncomeDto.distributions &&
        createIncomeDto.distributions.length > 0
      ) {
        let totalPercentage = 0;

        for (const dist of createIncomeDto.distributions) {
          // Validar que cada dist tenga los datos necesarios para evitar "unsafe assignment"
          const pId = Number(dist.purposeId);
          const pPercentage = Number(dist.percentage);

          const amountToDistribute =
            (createIncomeDto.incomeAmount * pPercentage) / 100;
          totalPercentage += pPercentage;

          // Crear registro en la tabla intermedia
          // Nota: Asegúrate de que en IncomeDistributionEntity la relación sea 'purpose'
          const distribution = queryRunner.manager.create(
            IncomeDistributionEntity,
            {
              income: savedIncome,
              purpose: { purpose_id: pId } as PurposeEntity, // Usamos la clave correcta: purpose_id
              amount: amountToDistribute,
            },
          );
          await queryRunner.manager.save(distribution);

          // Actualizar saldo del Propósito (Atómico)
          // CRÍTICO: Usar los nombres de propiedad definidos en PurposeEntity
          await queryRunner.manager.increment(
            PurposeEntity,
            { purpose_id: pId }, // Tu entidad usa purpose_id
            "purpose_balance", // Tu entidad usa purpose_balance
            amountToDistribute,
          );
        }

        if (totalPercentage > 100) {
          // Hacemos el rollback manual antes de lanzar la excepción para estar seguros
          throw new BadRequestException(
            "El porcentaje total no puede superar el 100%",
          );
        }
      }

      // 4. Actualizar saldo de la cuenta bancaria
      await this.accountService.updateAccountAmount(
        createIncomeDto.accountId,
        createIncomeDto.incomeAmount,
        false,
      );

      // 5. Confirmar Transacción
      await queryRunner.commitTransaction();
      return savedIncome;
    } catch (err: unknown) {
      // Si algo falla, deshacemos todo
      await queryRunner.rollbackTransaction();

      if (err instanceof BadRequestException) throw err;

      const message = err instanceof Error ? err.message : "Error desconocido";
      throw new BadRequestException(`No se pudo crear el ingreso: ${message}`);
    } finally {
      // Siempre liberar el queryRunner
      await queryRunner.release();
    }
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
      // 1. Buscamos el ingreso con sus distribuciones
      // Importante: El nombre de la relación debe coincidir con tu entidad IncomeEntity
      const income = await queryRunner.manager.findOne(IncomeEntity, {
        where: { incomeId: id },
        relations: ["distributions", "distributions.purpose"],
      });

      if (!income) {
        throw new NotFoundException(`El ingreso con ID ${id} no existe.`);
      }

      // 2. Revertir saldos en los Propósitos vinculados
      if (income.distributions && income.distributions.length > 0) {
        for (const dist of income.distributions) {
          // Accedemos a los campos correctos de tu PurposeEntity
          // Usamos el ID del propósito que viene en la relación cargada
          const pId = dist.purpose.purpose_id;
          const amountToSubtract = Number(dist.amount);

          await queryRunner.manager.decrement(
            PurposeEntity,
            { purpose_id: pId },
            "purpose_balance", // Nombre exacto en tu PurposeEntity
            amountToSubtract,
          );
        }
      }

      // 3. Revertir saldo en la Cuenta bancaria
      // El tercer parámetro 'true' indica que es una resta (para anular el ingreso)
      await this.accountService.updateAccountAmount(
        income.accountId,
        income.incomeAmount,
        true,
      );

      // 4. Eliminar el ingreso
      // Si en IncomeEntity tienes @OneToMany(..., { cascade: true }),
      // TypeORM borrará automáticamente las filas en IncomeDistributionEntity.
      await queryRunner.manager.remove(income);

      await queryRunner.commitTransaction();
    } catch (err: unknown) {
      // Revertimos todos los cambios si algo falla
      await queryRunner.rollbackTransaction();

      if (err instanceof NotFoundException) throw err;

      const message = err instanceof Error ? err.message : "Error desconocido";
      throw new BadRequestException(
        `No se pudo eliminar el ingreso: ${message}`,
      );
    } finally {
      // Siempre liberamos el queryRunner para evitar fugas de memoria
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
