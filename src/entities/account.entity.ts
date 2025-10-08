import { Column, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Income } from "./income.entity";
import { Expense } from "./expense.entity";

export class Account {
  @PrimaryGeneratedColumn()
  account_id: number;

  @Column({
    type: "varchar",
  })
  account_type: string;

  @Column({ type: "float" })
  account_amount: number;

  @OneToMany(() => Income, (income) => income.account)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.account)
  expenses: Expense[];
}
