import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";
import {
  planendExpenseCategory,
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
  categoty: planendExpenseCategory;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 500,
    description: "Monto del gasto planificado",
    required: true,
  })
  amount: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Alta",
    description: "Prioridad del gasto realizado",
    required: true,
  })
  priority: plannedExpendPriority;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({ example: "2025-11-19" })
  planned_expend_date: Date;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1,
    description: "ID de la  planificacion asociada",
    required: true,
  })
  planning_id: number;
}
