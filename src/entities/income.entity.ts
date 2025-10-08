import { TypeIncome } from "src/income/interfaces/income.interface";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Account } from "./account.entity";
import { IsNotEmpty, IsNumber } from "class-validator";

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  income_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  income_date: Date;

  @Column({ type: "varchar" })
  income_type: TypeIncome;

  @Column({ type: "float" })
  income_amount: number;

  @Column({ type: "varchar" })
  income_details: string;

  @Column({ name: "account_id" }) // Especifica el nombre de la columna
  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.incomes)
  @JoinColumn({ name: "account_id" })
  account: Account;
}
