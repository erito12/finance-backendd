import { ApiProperty } from "@nestjs/swagger";
import { expenseCategory } from "../interface/expense.interface";
import { IsNotEmpty, IsNumber } from "class-validator";
// import { expenseType } from "../interface/expense.interface";

export class UpdateExpenseDto {
  @ApiProperty({
    example: "Compra de Producto",
    description: "Tipo de Gasto.",
    required: false,
  })
  expense_category: expenseCategory;

  @ApiProperty({
    example: 2000,
    description: "Monto del gasto.",
    required: false,
  })
  expense_amount: number;

  @ApiProperty({
    example: "Compra de viandas en el mercado",
    description: "Detalles del Gasto",
    required: false,
  })
  expense_details: string;

  @IsNotEmpty() // 👈 Ahora es obligatorio para saber de dónde descontar
  @IsNumber()
  purpose_id?: number;
}
