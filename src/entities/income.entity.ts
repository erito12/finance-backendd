import { TypeIncome } from "src/income/interfaces/income.interface";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
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
  amount: number;

  @Column({ type: "varchar" })
  details: string;

  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.incomes)
  account: Account;
}
