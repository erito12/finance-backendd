import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
} from "@nestjs/common";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/account.dto";

@Controller("account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }
  @Get()
  async getAll() {
    return this.accountService.finfAll();
  }
  @Get(":id")
  async getById(@Param("id") id: number) {
    const account = await this.accountService.getById(id);
    if (!account) {
      throw new HttpException("Cusnta no encontrada", HttpStatus.NOT_FOUND);
    }
    return account;
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
}
