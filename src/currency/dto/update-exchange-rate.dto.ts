import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, Min } from "class-validator";

export class UpdateExchangeRateDto {
  @ApiProperty({
    description: "Nuevo valor de la moneda en CUP",
    example: 245.5,
  })
  @IsNumber({}, { message: "El valor de la moneda debe ser un número" })
  @Min(0, { message: "El valor de la moneda no puede ser negativo" })
  exchangeRate: number;
}
