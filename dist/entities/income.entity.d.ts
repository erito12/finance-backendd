import { TypeIncome } from "src/income/income.interface";
export declare class Income {
    income_id: number;
    income_date: Date;
    income_type: TypeIncome;
    amount: number;
    account_type: AccountType;
    details: string;
}
