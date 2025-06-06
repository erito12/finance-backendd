import { AccountType, TypeIncome } from '../income.enums';
export declare class CreateIncomeDto {
    income_date: Date;
    income_type: TypeIncome;
    amount: number;
    account_type: AccountType;
}
export declare class UpdateIncomeDto {
    income_date?: Date;
    income_type?: TypeIncome;
    amount?: number;
    account_type: AccountType;
}
