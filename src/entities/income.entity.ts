import { TypeIncome } from "src/income/interfaces/income.interface";
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from "typeorm";
import { Account } from "./account.entity";

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

  @ManyToOne(() => Account, (account) => account.incomes)
  account: Account;
}
