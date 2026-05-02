import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Income } from "./income.entity";
import { Expense } from "./expense.entity";
import { CoinsType } from "../common/interface/coin-type.interface";

@Entity()
export class Account {
  @PrimaryGeneratedColumn()
  account_id: number;

  @Column({
    type: "varchar",
  })
  account_name: string;

  @Column({
    type: "varchar",
  })
  account_type: CoinsType;

  @Column({ type: "numeric" })
  account_amount: number;

  @OneToMany(() => Income, (income) => income.account)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.account)
  expenses: Expense[];
}
