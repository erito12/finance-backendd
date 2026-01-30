import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ExpensePlanning } from "./expense-planning.entity";

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

  @OneToMany(
    () => ExpensePlanning,
    (ExpensePlanning) => ExpensePlanning.planning,
  )
  planned_expends: ExpensePlanning[];

  @OneToMany(() => ExpensePlanning, (plannedIncome) => plannedIncome.planning)
  planned_incomes: ExpensePlanning[];
}
