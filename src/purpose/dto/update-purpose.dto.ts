import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";

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

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: "0",
    description: "Balance del presupuesto",
    required: false,
  })
  purposeBalance?: number;
}
