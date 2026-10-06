import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";

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

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 20,
    description: "Balance inicial del Presupuesto",
    required: true,
  })
  purposeBalance: number;
}
