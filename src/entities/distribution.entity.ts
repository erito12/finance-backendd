import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Account } from "./account.entity";

@Entity()
export class Distribution {
  @PrimaryGeneratedColumn()
  distribution_id: number;

  @Column({ type: "varchar" })
  distribution_type: string;

  @Column({ type: "varchar" })
  distribution_details: string;

  @Column({ type: "float" })
  distribution_amount: number;

  @ManyToOne(() => Account, (account) => account.distribution, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "account_id" })
  account: Account;
}
