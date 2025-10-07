import { ApiProperty } from "@nestjs/swagger";

export class CreateAccountDto {
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir cuentas que poseas",
  })
  account_type: string;
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
  account_type: string;
  @ApiProperty({
    example: "60000",
    description: "Monto inicial de la cuenta",
  })
  account_amount: number;
}
