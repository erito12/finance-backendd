import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive } from "class-validator";

export class ExchangeMoneyDto {
  @ApiProperty({
    example: 100,
    description: "Monto a intercambiar entre las cuentas",
    required: true,
  })
  @IsNumber()
  @IsPositive()
  amount: number;
}
