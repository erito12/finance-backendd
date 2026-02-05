import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from "typeorm";
import { Account } from "./account.entity";
import { expenseCategory } from "../expense/interface/expense.interface";

@Entity("expenses")
@Check(`"expense_amount" >= 0`)
export class Expense {
  @PrimaryGeneratedColumn("increment", { name: "expense_id" })
  expense_id: number;

  @Column({
    name: "expense_date",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  expense_date: Date;

  @Column({
    name: "expense_category",
    type: "varchar",
    length: 100,
  })
  expense_category: expenseCategory;

  @Column({
    name: "expense_amount",
    type: "decimal",
    precision: 15,
    scale: 2,
  })
  expense_amount: number;

  @Column({
    name: "expense_details",
    type: "text",
    nullable: true,
  })
  expense_details: string;

  @Column({ name: "account_id" })
  account_id: number;

  @ManyToOne(() => Account, (account) => account.expenses, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "account_id" })
  account: Account;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
  })
  created_at: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
  })
  updated_at: Date;
}
