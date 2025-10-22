import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";
import { accountTypes } from "../interfaces/account.interface";

export class UpdateAccountDto {
  @IsString()
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir cuentas que poseas",
    required: false,
  })
  account_type?: accountTypes;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: "60000",
    description: "Monto inicial de la cuenta",
    required: false,
  })
  account_amount?: number;
}
