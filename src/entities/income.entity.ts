import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Check,
} from "typeorm";
import { Account } from "./account.entity";

@Entity("incomes")
@Check(`"income_amount" >= 0`)
export class Income {
  @PrimaryGeneratedColumn("increment", { name: "income_id" })
  income_id: number;

  @Column({
    name: "income_date",
    type: "date",
    default: () => "CURRENT_DATE",
  })
  income_date: Date;

  @Column({
    name: "income_amount",
    type: "decimal",
    precision: 15,
    scale: 2,
  })
  income_amount: number;

  @Column({
    name: "income_description",
    type: "text",
    nullable: true,
  })
  income_description: string;

  @Column({ name: "account_id" })
  account_id: number;

  @ManyToOne(() => Account, (account) => account.incomes, {
    onDelete: "CASCADE",
    nullable: false,
  })
  @JoinColumn({ name: "account_id" })
  account: Account;

  @CreateDateColumn({
    name: "created_at",
    type: "timestamp",
  })
  created_at: Date;

  @UpdateDateColumn({
    name: "updated_at",
    type: "timestamp",
  })
  updated_at: Date;
}
