import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";

export class UpdateAccountDto {
  @IsString()
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir cuentas que poseas",
    required: true,
  })
  account_type: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: "60000",
    description: "Monto inicial de la cuenta",
  })
  account_amount: number;
}
