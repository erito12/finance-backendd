import { ApiProperty } from "@nestjs/swagger";
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";

export class CreatePurposeDto {
  @IsString()
  @ApiProperty({
    example: "Fondos de Ahorro",
    description: " Crear Presupuesto Basado en Porcentaje ",
    required: true,
  })
  purposeName: string;

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 20,
    description: "Porciento del presupuesto",
    required: true,
  })
  purposePercentage: number;

  @IsOptional()
  @IsIn(["percentage", "fixed"])
  @ApiProperty({
    example: "percentage",
    description: "Modo de asignación por defecto del propósito.",
    required: false,
  })
  defaultAllocationType?: "percentage" | "fixed";

  @IsOptional()
  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 30,
    description:
      "Valor de la asignación predeterminada: porcentaje o monto fijo.",
    required: false,
  })
  defaultAllocationValue?: number;

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 20,
    description: "Balance inicial del Presupuesto",
    required: true,
  })
  purposeBalance: number;
}
