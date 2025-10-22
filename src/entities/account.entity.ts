import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Income } from "./income.entity";
import { Expense } from "./expense.entity";
import { accountTypes } from "src/account/interfaces/account.interface";
// import { accounType } from "src/account/interfaces/account.dto";
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
  account_type: accountTypes;

  @Column({ type: "float" })
  account_amount: number;

  @OneToMany(() => Income, (income) => income.account)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.account)
  expenses: Expense[];
}
