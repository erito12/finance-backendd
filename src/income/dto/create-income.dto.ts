import { ApiProperty } from "@nestjs/swagger";
import { IncomeType } from "../interfaces/income.interface";
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class CreateIncomeDto {
  @ApiProperty({
    example: "Pago por Resultado",
    description: "Tipo de ingreso.",
  })
  incomeType: IncomeType;

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
  @IsString()
  @IsIn(["percentage", "fixed"])
  @ApiProperty({
    example: "percentage",
    description: "Modo de asignación a propósitos: percentage o fixed",
    required: false,
  })
  allocationMode?: "percentage" | "fixed";

  @IsOptional()
  @IsArray()
  @ApiProperty({
    example: [
      { purposeId: 1, percentage: 50 },
      { purposeId: 2, percentage: 50 },
    ],
    description:
      "Distribución a propósitos. Puede venir como porcentaje o monto fijo según allocationMode.",
  })
  distributions?: Array<{
    purposeId: number;
    percentage?: number;
    amount?: number;
  }>;
}
