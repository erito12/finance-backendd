import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";
import { accountTypes } from "../interfaces/account.interface";

export class CreateAccountDto {
  @IsString()
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir el nombre de esta cuenta",
    required: true,
  })
  account_name: string;

  @IsString()
  @ApiProperty({
    enum: ["Efectivo", "Tarjeta", "MLC", "USD", "USDT", "Clasica"],
    example: "Tarjeta",
    description: "Tipo de la cuenta ",
    required: true,
  })
  account_type: accountTypes;

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 2000,
    description: "Monto inicial de la cuenta",
    required: true,
  })
  account_amount: number;
}
