import { ApiProperty } from "@nestjs/swagger";
import { expenseType } from "../interface/expense.interface";
import { IsNotEmpty, IsNumber } from "class-validator";

export class CreateExpenseDto {
  @ApiProperty({
    example: "Compra de Producto",
    description: "Tipo de Gasto.",
  })
  expense_type: expenseType;

  @ApiProperty({
    example: "Compra de viandas en el mercado",
    description: "Detalles del Gasto",
  })
  expense_details: string;

  @ApiProperty({
    example: 2000,
    description: "Monto del gasto.",
  })
  expense_amount: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    description: "Introducir el id de la cuenta",
  })
  account_id: number;
}
