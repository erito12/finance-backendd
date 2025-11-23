import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import {
  plannedExpenseCategory,
  plannedExpendPriority,
} from "../interfaces/planned-expend.interface";

export class createPlannedExpendDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Aceite",
    description: "Nombre del gasto planificado",
    required: true,
  })
  planned_expend: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Alimentacion",
    description: "Categoria del gasto planificado",
    required: true,
  })
  categoty: plannedExpenseCategory;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Alta",
    description: "Prioridad del gasto realizado",
    required: true,
  })
  priority: plannedExpendPriority;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: "ID de la  planificacion asociada",
    required: true,
  })
  planning_id: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Pago de 4 libras de boniato",
    description: "Se describe el gasto",
  })
  description: string;

  @IsString()
  @ApiProperty({
    example: "Boniato",
    description: "Nombre del producto del gasto",
  })
  product_name?: string;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 500,
    description: "Monto del gasto planificado",
    required: true,
  })
  amount: number;
}
