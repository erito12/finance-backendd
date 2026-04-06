import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";

export class UpdatePurposeDto {
  @IsString()
  @ApiProperty({
    example: "Gastos Basicos",
    description: "Actualizar Presupuesto Basado en Porcentaje",
    required: false,
  })
  account_name?: string;

  @IsNumber()
  @ApiProperty({
    example: 30,
    description: "Añadir cuentas que poseas",
    required: false,
  })
  purpose_percentage?: number;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: "0",
    description: "Balance del presupuesto",
    required: false,
  })
  purpose_balance?: number;
}
