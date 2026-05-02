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
import { PurposeEntity } from "./purpose.entity";

@Entity()
export class Expense {
  @PrimaryGeneratedColumn()
  expense_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  expense_date: Date;

  @Column({ type: "varchar" })
  expense_category: expenseCategory;

  @Column({ type: "numeric" })
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

  @Column({ name: "purpose_id", nullable: true }) // nullable por si tienes gastos sin propósito
  purpose_id: number;

  @ManyToOne(() => PurposeEntity)
  @JoinColumn({ name: "purpose_id" })
  purpose: PurposeEntity;
}
