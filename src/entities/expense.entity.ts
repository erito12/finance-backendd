import { IsNotEmpty, IsNumber } from "class-validator";
// import { expenseType } from "src/expense/interface/expense.interface";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./account.entity";
import { expenseCategory } from "../expense/interface/expense.interface";

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  expense_date: Date;

  @Column({ type: "varchar" })
  expense_category: expenseCategory;

  @Column({ type: "float" })
  expense_amount: number;

  @Column({ type: "varchar" })
  expense_details: string;
  @Column({ name: "account_id" })
  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.expenses, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "account_id" })
  account: Account;
}
