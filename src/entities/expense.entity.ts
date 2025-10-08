import { IsNotEmpty, IsNumber } from "class-validator";
import { expenseType } from "src/expense/interface/expense.interface";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Account } from "./account.entity";

@Entity()
export class Expense {
  @PrimaryColumn()
  expense_id: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  income_date: Date;

  @Column({ type: "varchar" })
  expense_type: expenseType;

  @Column({ type: "float" })
  expense_amount: number;

  @Column({ type: "varchar" })
  expense_details: string;

  @IsNotEmpty()
  @IsNumber()
  account_id: number;

  @ManyToOne(() => Account, (account) => account.expenses)
  @JoinColumn({ name: "account_id" }) // Asegúrate de que esto esté presente
  account: Account;
}
