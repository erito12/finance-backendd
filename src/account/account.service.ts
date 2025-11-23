import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";

import { Repository } from "typeorm";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";
import { accountTypes } from "./interfaces/account.interface";
import { Account } from "../entities/account.entity";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(Account)
    private accountRepository: Repository<Account>,
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

  async updateAccountAmount(
    accountId: number,
    amountCnage: number,
    isExpense,
  ): Promise<Account> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new BadRequestException("La cuenta no existe.");
    }
    //Actualizar el monto de la cuenta
    account.account_amount += isExpense ? -amountCnage : amountCnage;

    return this.accountRepository.save(account);
  }

  async calculateTotalAmount(): Promise<number> {
    const accounts = await this.accountRepository.find();
    if (!accounts.length) {
      throw new BadRequestException("No hay cuentas registradas.");
    }

    // Objeto para almacenar las conversiones
    const conversionRates: Record<accountTypes, number> = {
      Efectivo: 1, // 1 Efectivo = 1 Efectivo
      Tarjeta: 1, // Asumimos que es igual a Efectivo
      MLC: 200, // 1 MLC = 270 Efectivo
      USD: 450, // 1 USD = 450 Efectivo
      USDT: 430, // 1 USDT = 430 Efectivo
      Clasica: 400, // 1 Clasica = 400 Efectivo
    };

    // Calcular el total en Efectivo
    return accounts.reduce((total, account) => {
      const conversionRate = conversionRates[account.account_type];
      const amountInEfectivo = account.account_amount * conversionRate;
      return total + amountInEfectivo;
    }, 0);
  }

  async getBalanceByAccountType(): Promise<Record<accountTypes, number>> {
    const accounts = await this.accountRepository.find();
    if (!accounts.length) {
      throw new BadRequestException("No hay cuentas registradas.");
    }

    const balanceByType: Record<accountTypes, number> = {
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

  async exchangeMoney(
    sourceAccountId: number,
    targetAccountId: number,
    amount: number,
  ): Promise<{ sourceAccount: Account; targetAccount: Account }> {
    const sourceAccount = await this.getById(sourceAccountId);
    const targetAccount = await this.getById(targetAccountId);

    if (!sourceAccount) {
      throw new BadRequestException("La cuenta de origen no existe.");
    }
    if (!targetAccount) {
      throw new BadRequestException("La cuenta de destino no existe.");
    }

    if (amount <= 0) {
      throw new BadRequestException("El monto debe ser un número positivo.");
    }
    if (sourceAccount.account_amount < amount) {
      throw new BadRequestException(
        "La cuenta de origen no tiene suficiente saldo.",
      );
    }

    // Definir las tasas de conversión
    const conversionRates: Record<string, number> = {
      Efectivo: 1,
      Tarjeta: 1,
      MLC: 200, // 1 MLC = 200 Efectivo
      USD: 450, // 1 USD = 450 Efectivo
      USDT: 430, // 1 USDT = 430 Efectivo
      Clasica: 400, // 1 Clasica = 400 Efectivo
    };

    let amountInTargetCurrency = amount;

    // Convertir el monto según los tipos de cuenta
    if (sourceAccount.account_type !== targetAccount.account_type) {
      const sourceRate = conversionRates[sourceAccount.account_type];
      const targetRate = conversionRates[targetAccount.account_type];

      // Convertir el monto a efectivo
      const amountInEfectivo = amount * sourceRate;

      // Convertir el monto de efectivo a la moneda de destino
      amountInTargetCurrency = amountInEfectivo / targetRate;
    }

    // Actualizar las cuentas
    sourceAccount.account_amount -= amount;
    targetAccount.account_amount += parseFloat(
      amountInTargetCurrency.toFixed(2),
    );

    await this.accountRepository.save(sourceAccount);
    await this.accountRepository.save(targetAccount);

    return {
      sourceAccount,
      targetAccount: {
        ...targetAccount,
        account_amount: parseFloat(targetAccount.account_amount.toFixed(2)),
      },
    };
  }

  async getAccountBalance(id: number): Promise<number> {
    const account = await this.getById(id);
    if (!account) {
      throw new BadRequestException("La cuenta no existe.");
    }
    return parseFloat(account.account_amount.toFixed(2));
  }
}
