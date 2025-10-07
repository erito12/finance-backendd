import { Body, Controller, Post } from "@nestjs/common";
import { AccountService } from "./account.service";
import { CreateAccountDto } from "./dto/account.dto";

@Controller("account")
export class AccountController {
  constructor(private readonly accountService: AccountService) {}

  @Post()
  async create(@Body() createAccountDto: CreateAccountDto) {
    return this.accountService.create(createAccountDto);
  }
}
