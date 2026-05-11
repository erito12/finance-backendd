import { ApiProperty } from "@nestjs/swagger";
import { IncomeType } from "../interfaces/income.interface";
import { IsArray, IsNotEmpty, IsNumber, IsOptional } from "class-validator";

export class CreateIncomeDto {
  @ApiProperty({
    example: "Pago por Resultado",
    description: "Tipo de ingreso.",
  })
  income_type: IncomeType;
  @ApiProperty({
    example: "Pago del mes de actual",
    description: "Detalles del Ingreso",
  })
  incomeDetails: string;

  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso.",
  })
  incomeAmount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: "Introducir el id de la cuenta",
  })
  accountId: number;

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: [
      { purposeId: 1, percentage: 50 },
      { purposeId: 2, percentage: 50 },
    ],
    description: "Distribución dinámica para este ingreso",
  })
  distributions?: { purposeId: number; percentage: number }[];
}
