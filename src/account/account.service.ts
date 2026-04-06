import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";

import { Account } from "../entities/account.entity";
import { CoinsType } from "../common/interface/coin-type.interface";
import { conversionRates } from "../common/interface/conversion-rates.interface";
import { ConversionService } from "../common/service/conversion/conversion.service";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
    private readonly conversionService: ConversionService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    if (!createAccountDto.account_type) {
      throw new BadRequestException("El tipo de cuenta es requerido.", {
        cause: new Error(),
        description: "No se está pasando el parámetro de tipo de cuenta",
      });
    }
    if (
      createAccountDto.account_amount === undefined ||
      createAccountDto.account_amount < 0
    ) {
      throw new BadRequestException(
        "El monto inicial de la cuenta es requerido y debe ser un número positivo.",
        {
          cause: new Error(),
          description:
            "No se está pasando el parámetro de monto de cuenta o es negativo",
        },
      );
    }
    const existingAccount = await this.accountRepository.findOne({
      where: { account_name: createAccountDto.account_name },
    });
    if (existingAccount) {
      throw new BadRequestException(
        "Ya existe una cuenta con el mismo nombre de cuenta.",
        {
          cause: new Error(),
          description:
            "No se puede crear una nueva cuenta con un tipo que ya existe",
        },
      );
    }
    const newAccount = this.accountRepository.create(createAccountDto);
    return this.accountRepository.save(newAccount);
  }

  async partialUpdate(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<Account | null> {
    const existingAccount = await this.getById(id);
    if (!existingAccount) {
      throw new BadRequestException(
        "No exixte la cuenta que desea actualizar.",
      );
    }
    await this.accountRepository.update(id, updateAccountDto);
    return this.getById(id);
  }

  async findAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  async getById(account_id: number): Promise<Account | null> {
    return this.accountRepository.findOneBy({ account_id });
  }

  async removeAll(): Promise<void> {
    await this.accountRepository.deleteAll();
  }
  async removeById(id: number): Promise<void> {
    if (!this.accountRepository) {
      throw new BadRequestException("No hay datos que borrar");
    }
    await this.accountRepository.delete(id);
  }

  //Metodos alternativos

  //Actualizar el monto de la cuenta
  async updateAccountAmount(
    accountId: number,
    amountChange: number,
    isExpense,
  ): Promise<Account> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new BadRequestException("La cuenta no existe.");
    }
    //Actualizar el monto de la cuenta
    account.account_amount += isExpense ? -amountChange : amountChange;

    return this.accountRepository.save(account);
  }

  async calculateTotalAmount(): Promise<number> {
    const accounts = await this.accountRepository.find();
    if (!accounts.length) {
      throw new BadRequestException("No hay cuentas registradas.");
    }

    // Calcular el total en Efectivo
    return accounts.reduce((total, account) => {
      const conversionRate = conversionRates[account.account_type];
      const amountInCash = account.account_amount * conversionRate;
      return total + amountInCash;
    }, 0);
  }

  async getBalanceByAccountType(): Promise<Record<CoinsType, number>> {
    const accounts = await this.accountRepository.find();
    if (!accounts.length) {
      throw new BadRequestException("No hay cuentas registradas.");
    }

    const balanceByType: Record<CoinsType, number> = {
      Efectivo: 0,
      Tarjeta: 0,
      MLC: 0,
      USD: 0,
      USDT: 0,
      Clasica: 0,
    };

    accounts.forEach((account) => {
      balanceByType[account.account_type] += account.account_amount;
    });

    return balanceByType;
  }

  async exchangeMoney(sourceId: number, targetId: number, amount: number) {
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

    // 3. Uso de la lógica genérica (Aquí está la magia)
    const convertedAmount = this.conversionService.calculateExchange(
      amount,
      source.account_type,
      target.account_type,
    );

    // 4. Aplicación de cambios
    source.account_amount -= amount;
    target.account_amount += convertedAmount;

    await this.accountRepository.save([source, target]);

    return {
      sourceAccount: source, // 'source' (variable) se asigna a 'sourceAccount' (llave)
      targetAccount: target,
    };
  }

  private validateExchange(source: Account, target: Account, amount: number) {
    if (!source || !target)
      throw new BadRequestException("Cuentas no encontradas");
    if (amount <= 0) throw new BadRequestException("Monto inválido");
    if (source.account_amount < amount)
      throw new BadRequestException("Saldo insuficiente");
  }

  async getAccountBalance(id: number): Promise<number> {
    const account = await this.getById(id);
    if (!account) {
      throw new BadRequestException("La cuenta no existe.");
    }
    return parseFloat(account.account_amount.toFixed(2));
  }
}
