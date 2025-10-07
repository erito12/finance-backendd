import { TypeIncome } from "src/income/interfaces/income.interface";
import { Account } from "./account.entity";
export declare class Income {
    income_id: number;
    income_date: Date;
    income_type: TypeIncome;
    amount: number;
    details: string;
    account: Account;
}
