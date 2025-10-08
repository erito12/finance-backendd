import { IsNotEmpty, IsNumber } from "class-validator";
import { expenseType } from "src/expense/interface/expense.interface";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./account.entity";

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  income_date: Date;

  @Column({ type: "varchar" })
  expense_type: expenseType;

  @Column({ type: "float" })
  expense_amount: number;

  @Column({ type: "varchar" })
  expense_details: string;

  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.expenses)
  @JoinColumn()
  account: Account;
}
