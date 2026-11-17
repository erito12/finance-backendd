import { ApiProperty } from "@nestjs/swagger";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class UpdatePurposeDto {
  @IsString()
  @ApiProperty({
    example: "Gastos Basicos",
    description: "Actualizar Presupuesto Basado en Porcentaje",
    required: false,
  })
  accountName?: string;

  @IsNumber()
  @ApiProperty({
    example: 30,
    description: "Añadir cuentas que poseas",
    required: false,
  })
  purposePercentage?: number;

  @IsOptional()
  @IsIn(["percentage", "fixed"])
  @ApiProperty({
    example: "percentage",
    description: "Modo de asignación predeterminada del propósito",
    required: false,
  })
  defaultAllocationType?: "percentage" | "fixed";

  @IsOptional()
  @IsNumber()
  @ApiProperty({
    example: 250,
    description: "Valor predeterminado para asignar a este propósito",
    required: false,
  })
  defaultAllocationValue?: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: "0",
    description: "Balance del presupuesto",
    required: false,
  })
  purposeBalance?: number;
}
