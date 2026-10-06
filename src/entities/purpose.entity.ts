import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Expense } from "./expense.entity";

@Entity()
export class PurposeEntity {
  @PrimaryGeneratedColumn()
  purposeId: number;

  @Column({ type: "varchar" })
  purposeName: string;

  @Column({ type: "numeric" })
  purposePercentage: number;

  @Column({ type: "numeric" })
  purposeBalance: number;

  @OneToMany(() => Expense, (expense) => expense.purpose)
  expenses: Expense[];
}
