import {
  planendExpenseCategory,
  plannedExpendPriority,
} from "src/planned-expend/interfaces/planned-expend.interface";
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Planning } from "./planning.entity";

@Entity()
export class PlannedExpend {
  @PrimaryGeneratedColumn()
  planned_expend_id: number;

  @Column({ type: "varchar" })
  category: planendExpenseCategory;

  @Column({ type: "float" })
  amount: number;

  @Column({ type: "date" })
  planned_date: Date;

  @Column({ type: "varchar" })
  priority: plannedExpendPriority;

  @Column({ type: "float" })
  planning_id: number;

  @ManyToOne(() => Planning, (planning) => planning.planned_expends, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "planning_id" })
  planning: Planning;
}
