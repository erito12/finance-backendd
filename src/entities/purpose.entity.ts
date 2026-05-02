import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "./expense.entity";

@Entity()
export class PurposeEntity {
  @PrimaryGeneratedColumn()
  purpose_id: number;

  @Column({ type: "varchar" })
  purpose_name: string;

  @Column({ type: "numeric" })
  purpose_percentage: number;

  @Column({ type: "numeric" })
  purpose_balance: number;

  @OneToMany(() => Expense, (expense) => expense.purpose)
  expenses: Expense[];
}
