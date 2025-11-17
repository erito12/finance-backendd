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
  planendExpenseCategory,
  plannedExpendPriority,
} from "../planned-expend/interfaces/planned-expend.interface";

@Entity()
export class PlannedExpend {
  @PrimaryGeneratedColumn()
  planned_expend_id: number;

  @Column({ type: "varchar" })
  category: planendExpenseCategory;

  @Column({ type: "float" })
  amount: number;

  @Column({ type: "date" })
  planned_expend_date: Date;

  @Column({ type: "varchar" })
  priority: plannedExpendPriority;

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
