import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
} from "@nestjs/common";
import { AccountService } from "./account.service";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateAccountDto } from "./dto/create-account.dto";

import { AccountEntity } from "../entities/account.entity";
import { ExchangeMoneyDto } from "../common/dto/ExchangeMoney.dto";

@Controller("account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }

  @Get()
  async findAll() {
    return this.accountService.findAll();
  }

  @Get("total-amount")
  async getTotalAmount(): Promise<number> {
    return this.accountService.calculateTotalAmount();
  }

  @Get("total-amount-per-account")
  async getTotalBalancePerAccount(): Promise<Record<string, number>> {
    return this.accountService.getBalanceByAccountType();
  }

  @Get(":id")
  async getById(@Param("id") id: number) {
    const account = await this.accountService.getById(id);
    if (!account) {
      throw new HttpException("Cuenta no encontrada", HttpStatus.NOT_FOUND);
    }
    return account;
  }

  @Get(":id/balance")
  async getBalance(@Param("id") id: number) {
    return this.accountService.getAccountBalance(id);
  }

  @Put(":id")
  async updateById(
    @Param("id") id: number,
    @Body() updateAccountDto: UpdateAccountDto,
  ) {
    const updatedAccount = await this.accountService.partialUpdate(
      id,
      updateAccountDto,
    );
    if (!updatedAccount) {
      throw new HttpException(
        "No esta funcionadndo actualizar cuenta",
        HttpStatus.NOT_FOUND,
      );
    }
    return updatedAccount;
  }

  @Delete()
  async removeAll() {
    return this.accountService.removeAll();
  }

  @Delete(":id")
  async removeById(@Param("id") id: number) {
    const account = await this.accountService.getById(id);
    if (!account) {
      throw new HttpException("La cuenta no existe", HttpStatus.NOT_FOUND);
    }

    return this.accountService.removeById(id);
  }

  // Cambiamos el tipo de retorno para incluir convertedAmount y usamos los nombres correctos
  @Put("exchange/:sourceAccountId/:targetAccountId")
  async exchangeMoney(
    @Param("sourceAccountId") sourceAccountId: number,
    @Param("targetAccountId") targetAccountId: number,
    @Body() exchangeMoneyDto: ExchangeMoneyDto,
  ): Promise<{
    source: AccountEntity;
    target: AccountEntity;
    convertedAmount: number;
  }> {
    return this.accountService.exchangeMoney(
      sourceAccountId,
      targetAccountId,
      exchangeMoneyDto.amount,
    );
  }
}
