import { Account } from "src/entities/account.entity";
import { Repository } from "typeorm";
import { CreateAccountDto } from "./dto/account.dto";
export declare class AccountService {
    private accountRepository;
    constructor(accountRepository: Repository<Account>);
    create(createAccountDto: CreateAccountDto): Promise<Account>;
}
