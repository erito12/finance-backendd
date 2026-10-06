import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IncomeEntity } from "./income.entity";
import { PurposeEntity } from "./purpose.entity";

@Entity()
export class IncomeDistributionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "numeric", nullable: true })
  amount: number;

  @Column({ type: "numeric", nullable: true })
  percentage: number;

  @Column({ name: "income_id", nullable: true })
  incomeId: number | null;

  @ManyToOne(() => IncomeEntity, (income) => income.distributions, {
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "income_id" })
  income: IncomeEntity | null;

  @Column({ name: "purpose_id", nullable: true })
  purposeId: number | null;

  @ManyToOne(() => PurposeEntity, {
    eager: true,
    onDelete: "CASCADE",
    nullable: true,
  })
  @JoinColumn({ name: "purpose_id" })
  purpose: PurposeEntity | null;
}
