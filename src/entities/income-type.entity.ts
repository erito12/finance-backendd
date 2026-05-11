import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class IncomeTypeEntity {
  @PrimaryGeneratedColumn()
  incomeTypeId: number;

  @Column()
  incomeTypeName: string;

  @Column()
  incomeCategory: string;
}
