import { AccountType, TypeIncome } from "../income.interface";
export declare class CreateIncomeDto {
    income_type: TypeIncome;
    details: string;
    amount: number;
    account_type: AccountType;
}
export declare class UpdateIncomeDto {
    income_type?: TypeIncome;
    amount?: number;
    account_type: AccountType;
}
