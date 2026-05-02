import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { AccountEntity } from "./account.entity";

@Entity()
export class CurrencyEntity {
  @PrimaryGeneratedColumn()
  currency_id: number;

  @Column({ unique: true })
  code: string; // "USD", "CUP", "MLC", "BTC"

  @Column()
  name: string; // "Dólar", "Peso Cubano", "Moneda Libremente Convertible"

  @Column({ default: "$" })
  symbol: string;

  @Column({ default: false })
  is_custom: boolean; // Indica si la creó el usuario o viene por defecto

  @Column({
    type: "numeric",
    precision: 12,
    scale: 4, // Usamos 4 decimales para mayor precisión en tasas de cambio
    default: 1.0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  exchangeRate: number;

  @OneToMany(() => AccountEntity, (account) => account.currency)
  accounts: AccountEntity[];
}
