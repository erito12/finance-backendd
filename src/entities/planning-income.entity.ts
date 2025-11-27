import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Planning } from "./planning.entity";
import { IncomeType } from "../income/interfaces/income.interface";

@Entity()
export class IncomePlanning {
  @PrimaryGeneratedColumn()
  income_planning_id: number;

  @Column({ type: "varchar" })
  income_planning_type: IncomeType;

  @Column({ type: "float" })
  income_planning_amount: number;

  @Column({ type: "float" })
  planning_id: number;

  @ManyToOne(() => Planning, (planning) => planning.planned_incomes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "planning_id" })
  planning: Planning;
}
