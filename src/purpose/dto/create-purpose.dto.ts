import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreatePurposeDto {
  @IsString()
  @ApiProperty({
    example: "Fondos de Ahorro",
    description: " Crear Presupuesto Basado en Porcentaje ",
    required: true,
  })
  purpose_name: string;

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 20,
    description: "Porciento del presupuesto",
    required: true,
  })
  purpose_percentage: number;

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 20,
    description: "Balance inicial del Presupuesto",
    required: true,
  })
  purpose_balance: number;
}
