import { ApiProperty } from "@nestjs/swagger";
import { TypeIncome } from "../interfaces/income.interface";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateIncomeDto {
  @ApiProperty({
    example: "Pago por Resultado",
    description: "Tipo de ingreso.",
  })
  income_type: TypeIncome;
  @ApiProperty({
    example: "Pago del mes de actual",
    description: "Detalles del Ingreso",
  })
  income_details: string;

  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso.",
  })
  income_amount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: "Introducir el id de la cuenta",
  })
  account_id: number;
}
