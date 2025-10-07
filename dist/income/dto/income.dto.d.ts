import { TypeIncome } from "../interfaces/income.interface";
export declare class CreateIncomeDto {
    income_type: TypeIncome;
    details: string;
    amount: number;
}
export declare class UpdateIncomeDto {
    income_type?: TypeIncome;
    amount?: number;
    details: string;
}
