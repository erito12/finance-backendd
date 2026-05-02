import { ApiProperty } from "@nestjs/swagger";
import { IsEnum, IsInt, IsNumber, IsPositive } from "class-validator";

import { AccountStorageType } from "../../common/enum/AccountStorageType";

export class UpdateAccountDto {
  @ApiProperty({
    example: "tarjeta personal",
    description: "Añadir el nombre de esta cuenta",
    required: false,
  })
  accountName?: string;

  @IsInt()
  @ApiProperty({ description: "ID de la moneda (Currency)", required: true })
  currencyId: number;

  @IsEnum(AccountStorageType)
  @ApiProperty({
    enum: AccountStorageType,
    example: AccountStorageType.VIRTUAL,
  })
  storageType?: AccountStorageType;

  @IsPositive()
  @IsNumber()
  @ApiProperty({
    example: 2000,
    description: "Monto inicial de la cuenta",
    required: true,
  })
  initialBalance: number;
}
