import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Planning } from "./planning.entity";

@Entity()
export class PlannedIncome {
  @PrimaryGeneratedColumn()
  planned_income_id: number;

  @Column({ type: "varchar" })
  title_income: string;

  @Column({ type: "float" })
  amount_income: number;

  @Column({ type: "date" })
  planned_date_income: Date;

  @Column({ type: "float" })
  planning_id: number;
  @ManyToOne(() => Planning, (planning) => planning.planned_incomes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "planning_id" })
  planning: Planning;
}
