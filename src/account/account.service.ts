import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";

import { AccountEntity } from "../entities/account.entity";
import { CurrencyEntity } from "../entities/currency.entity";
import { ConversionService } from "../common/service/conversion/conversion.service";

@Injectable()
export class AccountService {
  constructor(
    @InjectRepository(AccountEntity)
    private accountRepository: Repository<AccountEntity>,
    @InjectRepository(CurrencyEntity)
    private currencyRepository: Repository<CurrencyEntity>,
    private readonly conversionService: ConversionService,
  ) {}

  async create(createAccountDto: CreateAccountDto): Promise<AccountEntity> {
    if (!createAccountDto.storageType) {
      throw new BadRequestException("El tipo de almacenamiento es requerido.", {
        cause: new Error(),
        description:
          "No se está pasando el parámetro de tipo de almacenamiento",
      });
    }
    if (
      createAccountDto.initialBalance === undefined ||
      createAccountDto.initialBalance < 0
    ) {
      throw new BadRequestException(
        "El saldo inicial de la cuenta es requerido y debe ser un número positivo.",
        {
          cause: new Error(),
          description:
            "No se está pasando el parámetro de saldo inicial o es negativo",
        },
      );
    }
    const currency = await this.currencyRepository.findOneBy({
      currency_id: createAccountDto.currencyId,
    });
    if (!currency) {
      throw new BadRequestException("La moneda especificada no existe.", {
        cause: new Error(),
        description: "No se encontró ninguna moneda con ese ID",
      });
    }

    const existingAccount = await this.accountRepository.findOne({
      where: { accountName: createAccountDto.accountName },
    });
    if (existingAccount) {
      throw new BadRequestException(
        "Ya existe una cuenta con el mismo nombre de cuenta.",
        {
          cause: new Error(),
          description:
            "No se puede crear una nueva cuenta con un nombre que ya existe",
        },
      );
    }
    const newAccount = this.accountRepository.create({
      accountName: createAccountDto.accountName,
      storageType: createAccountDto.storageType,
      initialBalance: createAccountDto.initialBalance,
      totalBalance: createAccountDto.initialBalance,
      currency,
    });
    return this.accountRepository.save(newAccount);
  }

  async partialUpdate(
    id: number,
    updateAccountDto: UpdateAccountDto,
  ): Promise<AccountEntity | null> {
    const existingAccount = await this.getById(id);
    if (!existingAccount) {
      throw new BadRequestException(
        "No existe la cuenta que desea actualizar.",
      );
    }
    await this.accountRepository.update(id, updateAccountDto);
    return this.getById(id);
  }

  async findAll(): Promise<AccountEntity[]> {
    return this.accountRepository.find();
  }

  async getById(accountId: number): Promise<AccountEntity | null> {
    return this.accountRepository.findOneBy({ accountId });
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

  //Actualizar el saldo de la cuenta
  async updateAccountAmount(
    accountId: number,
    amountChange: number,
    isExpense,
  ): Promise<AccountEntity> {
    const account = await this.getById(accountId);
    if (!account) {
      throw new BadRequestException("La cuenta no existe.");
    }
    //Actualizar el saldo de la cuenta
    account.totalBalance += isExpense ? -amountChange : amountChange;

    return this.accountRepository.save(account);
  }

  async calculateTotalAmount(): Promise<number> {
    const accounts = await this.accountRepository.find();
    if (!accounts.length) {
      throw new BadRequestException("No hay cuentas registradas.");
    }

    // Calcular el total por divisa
    return accounts.reduce((total, account) => {
      return total + account.totalBalance;
    }, 0);
  }

  async getBalanceByAccountType(): Promise<Record<string, number>> {
    const accounts = await this.accountRepository.find();
    if (!accounts.length) {
      throw new BadRequestException("No hay cuentas registradas.");
    }

    const balanceByType: Record<string, number> = {};

    accounts.forEach((account) => {
      const currencyCode = account.currency?.code || "USD";
      if (!balanceByType[currencyCode]) {
        balanceByType[currencyCode] = 0;
      }
      balanceByType[currencyCode] += account.totalBalance;
    });

    return balanceByType;
  }

  async exchangeMoney(sourceId: number, targetId: number, amount: number) {
    const source = await this.getById(sourceId);
    const target = await this.getById(targetId);

    if (!source || !target) {
      throw new BadRequestException("Una o ambas cuentas no existen");
    }

    this.validateExchange(source, target, amount);

    // Calcular el monto convertido según las divisas
    const convertedAmount = await this.conversionService.calculateExchange(
      amount,
      source.currency.code,
      target.currency.code,
    );

    source.totalBalance -= amount;
    target.totalBalance += convertedAmount;

    await this.accountRepository.save([source, target]);

    return { source, target, convertedAmount };
  }
  private validateExchange(
    source: AccountEntity,
    target: AccountEntity,
    amount: number,
  ) {
    if (!source || !target)
      throw new BadRequestException("Cuentas no encontradas");
    if (amount <= 0) throw new BadRequestException("Monto inválido");
    if (source.totalBalance < amount)
      throw new BadRequestException("Saldo insuficiente");
  }

  async getAccountBalance(id: number): Promise<number> {
    const account = await this.getById(id);
    if (!account) {
      throw new BadRequestException("La cuenta no existe.");
    }
    return parseFloat(account.totalBalance.toFixed(2));
  }
}
