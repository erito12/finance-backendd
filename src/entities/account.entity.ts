import {
  Column,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Income } from "./income.entity";
import { Expense } from "./expense.entity";
import { accountTypes } from "../account/interfaces/account.interface";

@Entity("accounts")
export class Account {
  @PrimaryGeneratedColumn("increment", { name: "account_id" })
  account_id: number;

  @Column({
    type: "varchar",
    length: 100,
    nullable: false,
  })
  account_name: string;

  @Column({
    type: "varchar",
    length: 50,
    nullable: false,
  })
  account_type: accountTypes;

  @Column({
    type: "decimal",
    precision: 15,
    scale: 2,
    default: 0.0,
  })
  account_amount: number;

  @OneToMany(() => Income, (income) => income.account)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.account)
  expenses: Expense[];

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
