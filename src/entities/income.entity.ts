import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Account } from "./account.entity";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IncomeType } from "../income/interfaces/income.interface";

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  income_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  income_date: Date;

  @Column({ type: "varchar" })
  income_type: IncomeType;

  @Column({ type: "numeric" })
  income_amount: number;

  @Column({ type: "varchar" })
  income_details: string;

  @Column({ name: "account_id" })
  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.incomes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "account_id" })
  account: Account;
}
