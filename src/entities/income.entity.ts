import { TypeIncome } from "src/income/income.interface";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

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

  @Column({
    type: "varchar",
  })
  account_type: AccountType;

  @Column({ type: "varchar" })
  details: string;
}
