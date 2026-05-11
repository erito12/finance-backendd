import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { IncomeEntity } from "./income.entity";
import { PurposeEntity } from "./purpose.entity";

// income-distribution.entity.ts
@Entity()
export class IncomeDistributionEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "numeric" })
  amount: number; // El monto calculado (o el porcentaje)

  @ManyToOne(() => IncomeEntity, (income) => income.distributions)
  income: IncomeEntity;

  @ManyToOne(() => PurposeEntity)
  @JoinColumn({ name: "purpose_id" }) // nombre en la DB
  purpose: PurposeEntity; // nombre de la propiedad
}
