import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Planning } from "./planning.entity";
import { IsNotEmpty, IsNumber } from "class-validator";
import {
  plannedExpenseCategory,
  plannedExpendPriority,
} from "../planned-expend/interfaces/planned-expend.interface";

@Entity()
export class ExpensePlanning {
  @PrimaryGeneratedColumn()
  planned_expend_id: number;

  @Column({ type: "varchar" })
  category: plannedExpenseCategory;

  @Column({ type: "float" })
  amount: number;

  @Column({ type: "varchar" })
  priority: plannedExpendPriority;

  @Column({ type: "varchar" })
  description: string;

  @Column({ type: "varchar" })
  product_name?: string;

  @Column({ type: "float" })
  @IsNotEmpty()
  @IsNumber()
  planning_id: number;

  @ManyToOne(() => Planning, (planning) => planning.planned_expends, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "planning_id" })
  planning: Planning;
}
