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

  @Column({ type: "varchar", nullable: true })
  defaultAllocationType: "percentage" | "fixed" | null;

  @Column({ type: "numeric", nullable: true })
  defaultAllocationValue: number | null;

  @OneToMany(() => Expense, (expense) => expense.purpose)
  expenses: Expense[];
}
