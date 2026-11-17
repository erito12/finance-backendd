import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PurposeEntity } from "../entities/purpose.entity";
import { Repository } from "typeorm";
import { CreatePurposeDto } from "./dto/create-purpose.dto";
import { UpdatePurposeDto } from "./dto/update-purpose.dto";
import { ConversionService } from "../common/service/conversion/conversion.service";

@Injectable()
export class PurposeService {
  constructor(
    @InjectRepository(PurposeEntity)
    private purposeRepository: Repository<PurposeEntity>,
    private readonly conversionService: ConversionService,
  ) {}

  async create(createPurposeDto: CreatePurposeDto): Promise<PurposeEntity> {
    // 1. Validaciones de existencia de campos (ya las tienes)
    if (!createPurposeDto.purposeName) {
      throw new BadRequestException("El nombre de Presupuesto es requerido.");
    }

    const purposePercentage = Number(createPurposeDto.purposePercentage);

    // 2. Validación de rango individual (0-100)
    if (!Number.isFinite(purposePercentage) || purposePercentage <= 0) {
      throw new BadRequestException("El porcentaje debe estar entre 0 y 100");
    }

    if (purposePercentage > 100) {
      throw new BadRequestException("El porcentaje debe estar entre 0 y 100");
    }

    this.validateDefaultAllocation(
      createPurposeDto.defaultAllocationType,
      createPurposeDto.defaultAllocationValue,
    );

    // 3. LLAMADA A LA VALIDACIÓN DE LÍMITE TOTAL (Esto es lo que te faltaba)
    // Verifica que la suma de todos los propósitos no pase de 100
    await this.validatePercentageLimit(purposePercentage);

    // 4. Verificar duplicados
    const existPurpose = await this.purposeRepository.findOne({
      where: { purposeName: createPurposeDto.purposeName },
    });

    if (existPurpose) {
      throw new BadRequestException("Ya existe un Presupuesto con este nombre");
    }

    // 5. Crear con balance inicial en 0
    const newPurpose = this.purposeRepository.create({
      ...createPurposeDto,
      purposeBalance: 0,
    });

    return this.purposeRepository.save(newPurpose);
  }

  async partialUpdate(
    id: number,
    updatePurposeDto: UpdatePurposeDto,
  ): Promise<PurposeEntity | null> {
    const existPurpose = await this.getById(id);
    if (!existPurpose) {
      throw new BadRequestException("No existe el Presupuesto a actualizar");
    }

    this.validateDefaultAllocation(
      updatePurposeDto.defaultAllocationType,
      updatePurposeDto.defaultAllocationValue,
    );

    // Si se está intentando actualizar el porcentaje, validamos el nuevo total
    if (updatePurposeDto.purposePercentage !== undefined) {
      // Pasamos el ID actual para que no se sume a sí mismo en el cálculo
      await this.validatePercentageLimit(
        updatePurposeDto.purposePercentage,
        id,
      );
    }

    await this.purposeRepository.update(id, updatePurposeDto);
    return this.getById(id);
  }

  async getById(purposeId: number): Promise<PurposeEntity | null> {
    return this.purposeRepository.findOneBy({ purposeId });
  }

  //Obtener balances por cada propuesta
  async getAllBalances(): Promise<{ name: string; balance: number }[]> {
    const purposes = await this.findAll();

    return purposes.map((purpose) => ({
      name: purpose.purposeName,
      balance: purpose.purposeBalance,
    }));
  }

  async findAll(): Promise<PurposeEntity[]> {
    return this.purposeRepository.find();
  }

  async removeAll(): Promise<void> {
    await this.purposeRepository.deleteAll();
  }

  async removeById(id: number): Promise<void> {
    if (!this.purposeRepository) {
      throw new BadRequestException("No hay datos que borrar");
    }
    await this.purposeRepository.delete(id);
  }

  //Metodos alternativos
  //Metodo para obtener el total de porcentaje
  async getTotalPercentage(): Promise<number> {
    const purposes = await this.findAll();
    return purposes.reduce(
      (acc, p) => acc + Number(p.purposePercentage ?? 0),
      0,
    );
  }

  private validateDefaultAllocation(
    defaultAllocationType?: "percentage" | "fixed",
    defaultAllocationValue?: number,
  ): void {
    if (
      defaultAllocationType === undefined &&
      defaultAllocationValue === undefined
    ) {
      return;
    }

    if (
      defaultAllocationType === undefined ||
      defaultAllocationValue === undefined
    ) {
      throw new BadRequestException(
        "Si defines una asignación predeterminada, debes indicar el tipo y el valor.",
      );
    }

    if (defaultAllocationValue <= 0) {
      throw new BadRequestException(
        "El valor de la asignación predeterminada debe ser mayor que cero.",
      );
    }

    if (
      defaultAllocationType === "percentage" &&
      defaultAllocationValue > 100
    ) {
      throw new BadRequestException(
        "El porcentaje predeterminado no puede superar el 100%.",
      );
    }
  }

  private async validatePercentageLimit(
    newPercentage: number,
    excludeId?: number,
  ): Promise<void> {
    const purposes = await this.findAll();
    const currentTotal = purposes
      .filter((p) => p.purposeId !== excludeId)
      .reduce((acc, p) => acc + Number(p.purposePercentage ?? 0), 0);

    const totalAfterInsert = Number(currentTotal) + Number(newPercentage);

    if (totalAfterInsert > 100) {
      const available = 100 - Number(currentTotal);
      throw new BadRequestException(
        `El porcentaje total excedería el 100%. Solo tienes disponible un ${available}%`,
        {
          description:
            "La suma de todos los propósitos no puede ser mayor a 100",
        },
      );
    }
  }

  // async updateBalance(id: number, amount: number): Promise<void> {
  //   const purpose = await this.getById(id);
  //   if (!purpose) throw new BadRequestException("Propósito no encontrado");

  //   purpose.purpose_balance += amount;

  //   // Opcional: Validar que no quede en negativo si es un gasto
  //   if (purpose.purpose_balance < 0) {
  //     // Aquí decides si permites saldo negativo o lanzas error
  //     console.warn(
  //       `Aviso: El presupuesto ${purpose.purpose_name} está en negativo.`,
  //     );
  //   }

  //   await this.purposeRepository.save(purpose);
  // }

  async updateBalance(purposeId: number, amount: number): Promise<void> {
    const purpose = await this.getById(purposeId);
    if (!purpose)
      throw new NotFoundException(`Propósito ${purposeId} no encontrado`);

    // Sumamos el monto al saldo actual
    purpose.purposeBalance = Number(purpose.purposeBalance) + Number(amount);

    await this.purposeRepository.save(purpose);
  }

  async distributeIncome(totalAmount: number): Promise<void> {
    const purposes = await this.findAll();

    for (const purpose of purposes) {
      const percentage = Number(purpose.purposePercentage ?? 0);
      const amountToAssign = (totalAmount * percentage) / 100;
      await this.updateBalance(purpose.purposeId, amountToAssign);
    }
  }

  async exchangeMoneyPurpose(
    sourceId: number,
    targetId: number,
    amount: number,
  ) {
    // 1. Obtención de datos (Específico de este módulo)
    const [source, target] = await Promise.all([
      this.getById(sourceId),
      this.getById(targetId),
    ]);
    // Esta validación es la "guarda".
    // Si source o target son null, lanzamos una excepción y el código se detiene.
    if (!source || !target) {
      throw new BadRequestException("Una o ambas cuentas no existen.");
    }

    // A partir de aquí, para TS, 'source' y 'target' ya NO son null, son 'Account'.
    this.validateExchange(source, target, amount);
    source.purposeBalance -= amount;
    target.purposeBalance += amount;

    await this.purposeRepository.save([source, target]);

    return {
      source: source,
      target: target,
    };
  }

  private validateExchange(
    source: PurposeEntity,
    target: PurposeEntity,
    amount: number,
  ) {
    if (!source || !target)
      throw new BadRequestException("Cuentas no encontradas");
    if (amount <= 0) throw new BadRequestException("Monto inválido");
    if (source.purposeBalance < amount)
      throw new BadRequestException("Saldo insuficiente");
  }
}
