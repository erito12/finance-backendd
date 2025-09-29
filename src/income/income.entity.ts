import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";
import { AccountType, TypeIncome } from "./income.enums";

@Entity()
export class Income {
  @PrimaryGeneratedColumn()
  income_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  income_date: Date;

  @Column({ type: "varchar", enum: TypeIncome })
  income_type: TypeIncome;

  @Column({ type: "float" })
  amount: number;

  @Column({
    type: "varchar",
    enum: AccountType,
  })
  account_type: AccountType;

  @Column({ type: "varchar" })
  details: string;
}
