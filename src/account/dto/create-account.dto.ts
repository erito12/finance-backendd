import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";

export class CreateAccountDto {
  @IsString()
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir cuentas que poseas",
    required: true,
  })
  account_type: string;
  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: "12000",
    description: "Monto inicial de la cuenta",
    required: true,
  })
  account_amount: number;
}
