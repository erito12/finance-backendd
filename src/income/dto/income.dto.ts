import { IsNotEmpty, IsNumber } from "class-validator";
import { TypeIncome } from "../interfaces/income.interface";
import { ApiProperty } from "@nestjs/swagger";

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
  details: string;

  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso.",
  })
  amount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: "Introducir el id de la cuenta",
  })
  account_id: number;
}

export class UpdateIncomeDto {
  @ApiProperty({
    example: "Pago por Resultado",
    description: "Tipo de ingreso.",
    required: false,
  })
  income_type?: TypeIncome;

  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso.",
    required: false,
  })
  amount?: number;
  @ApiProperty({
    example: "Pago del mes de actual",
    description: "Detalles del Ingreso",
  })
  details: string;
}
