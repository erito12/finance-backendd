import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { PlannedExpend } from "./planning-expend.entity";

@Entity()
export class Planning {
  @PrimaryGeneratedColumn()
  planning_id: number;

  @Column({ type: "varchar" })
  planning_name: string;

  @Column({ type: "float" })
  initial_budget: number;

  @Column({ type: "date" })
  start_date: Date;

  @Column({ type: "date" })
  end_date: Date;

  @OneToMany(() => PlannedExpend, (plannedExpend) => plannedExpend.planning)
  planned_expends: PlannedExpend[];

  @OneToMany(() => PlannedExpend, (plannedIncome) => plannedIncome.planning)
  planned_incomes: PlannedExpend[];
}
