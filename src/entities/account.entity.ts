import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Income } from "./income.entity";
// import { AccountType } from "src/account/interfaces/account.interface";
@Entity()
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
}
