import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Account } from "src/entities/account.entity";
import { Repository } from "typeorm";
import { CreateAccountDto } from "./dto/account.dto";

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
    const newAccount = this.accountRepository.create({
      account_type: createAccountDto.account_type,
      account_amount: createAccountDto.account_amount,
    });
    return this.accountRepository.save(newAccount);
  }

  async finfAll(): Promise<Account[]> {
    return this.accountRepository.find();
  }

  async findOne(account_id: number): Promise<Account | null> {
    return this.accountRepository.findOneBy({ account_id });
  }
}
