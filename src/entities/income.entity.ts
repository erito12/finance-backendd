import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from "typeorm";
import { AccountEntity } from "./account.entity";
import { IsNotEmpty, IsNumber } from "class-validator";
import { IncomeType } from "../income/interfaces/income.interface";
import { IncomeDistributionEntity } from "./income-distribution.entity";

@Entity()
export class IncomeEntity {
  @PrimaryGeneratedColumn()
  incomeId: number;

  @Column({ type: "date", default: () => "CURRENT_DATE" })
  incomeDate: Date;

  @Column({ type: "varchar" })
  incomeType: IncomeType;

  @Column({ type: "numeric" })
  incomeAmount: number;

  @Column({ type: "varchar" })
  incomeDetail: string;

  @Column({ name: "account_id" })
  @IsNotEmpty()
  @IsNumber()
  accountId: number;

  @ManyToOne(() => AccountEntity, (account) => account.incomes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "account_id" })
  account: AccountEntity;

  @OneToMany(() => IncomeDistributionEntity, (dist) => dist.income, {
    cascade: true,
  })
  distributions: IncomeDistributionEntity[];
}
