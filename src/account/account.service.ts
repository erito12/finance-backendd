import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "src/entities/account.entity";
import { Repository } from "typeorm";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";

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
    if (!existingAccount) return null;
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
      return 0; // O puedes lanzar una excepción si prefieres
    }
    return accounts.reduce(
      (total, account) => total + account.account_amount,
      0,
    );
  }
}
