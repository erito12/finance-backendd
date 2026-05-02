import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Income } from "./income.entity";
import { Expense } from "./expense.entity";
import { CurrencyEntity } from "./currency.entity";
import { AccountStorageType } from "../common/enum/AccountStorageType";

@Entity()
export class AccountEntity {
  @PrimaryGeneratedColumn()
  accountId: number;

  @Column({
    type: "varchar",
  })
  accountName: string;

  @Column({
    type: "enum",
    enum: AccountStorageType,
    default: AccountStorageType.VIRTUAL,
  })
  storageType: AccountStorageType;

  @Column({
    type: "numeric",
    precision: 12, // Longitud total del número
    scale: 2, // Cantidad de decimales
    // ESTA ES LA SOLUCIÓN:
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  initialBalance: number;

  @Column({
    type: "numeric",
    precision: 12, // Longitud total del número
    scale: 2, // Cantidad de decimales
    // ESTA ES LA SOLUCIÓN:
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  totalBalance: number;

  @OneToMany(() => Income, (income) => income.account)
  incomes: Income[];

  @OneToMany(() => Expense, (expense) => expense.account)
  expenses: Expense[];

  // CAMBIO AQUÍ: Relación con la nueva entidad Currency
  @ManyToOne(() => CurrencyEntity, { eager: true })
  @JoinColumn({ name: "currency_id" })
  currency: CurrencyEntity;
}
