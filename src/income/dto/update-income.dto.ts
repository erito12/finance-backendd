import { IncomeType } from "../interfaces/income.interface";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateIncomeDto {
  @ApiProperty({
    example: "Pago por Resultado",
    description: "Tipo de ingreso.",
    required: false,
  })
  income_type?: IncomeType;

  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso.",
    required: false,
  })
  incomeAmount?: number;

  @ApiProperty({
    example: "Pago del mes de actual",
    description: "Detalles del Ingreso",
  })
  incomeDetails: string;
}
