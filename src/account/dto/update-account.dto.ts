import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";
import { accountTypes } from "../interfaces/account.interface";

export class UpdateAccountDto {
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir el nombre de esta cuenta",
    required: true,
  })
  account_name: string;
  @IsString()
  @ApiProperty({
    example: "Efectivo",
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
