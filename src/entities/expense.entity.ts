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

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  expense_date: Date;

  @Column({ type: "varchar" })
  expense_type: string;

  @Column({ type: "float" })
  expense_amount: number;

  @Column({ type: "varchar" })
  expense_details: string;

  @Column({ name: "account_id" }) // Especifica el nombre de la columna
  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.expenses)
  @JoinColumn({ name: "account_id" })
  account: Account;
}
