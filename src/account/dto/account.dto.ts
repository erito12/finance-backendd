import { ApiProperty } from "@nestjs/swagger";
import { AccountType } from "../interfaces/account.interface";

export class CreateAccountDto {
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir cuentas que poseas",
  })
  account_type: AccountType;
  @ApiProperty({
    example: "12000",
    description: "Monto inicial de la cuenta",
  })
  account_amount: number;
}
export class UpdateAccountDto {
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir cuentas que poseas",
  })
  account_type: AccountType;
  @ApiProperty({
    example: "60000",
    description: "Monto inicial de la cuenta",
  })
  account_amount: number;
}
