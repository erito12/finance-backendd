import { ApiProperty } from "@nestjs/swagger";

import { AccountStorageType } from "../../common/enum/AccountStorageType";
import {
  IsEnum,
  IsInt,
  IsNumber,
  IsPositive,
  IsString,
  Min,
} from "class-validator";

export class CreateAccountDto {
  @IsString()
  @ApiProperty({
    example: "Tarjeta Clásica",
    description: "Nombre de la cuenta",
    required: true,
  })
  accountName: string;

  @IsInt()
  @IsPositive()
  @ApiProperty({
    description: "ID de la moneda (Currency)",
    example: 1,
    required: true,
  })
  currencyId: number;

  @IsEnum(AccountStorageType)
  @ApiProperty({
    enum: AccountStorageType,
    example: AccountStorageType.VIRTUAL,
    description: "Tipo de almacenamiento de la cuenta",
    default: AccountStorageType.VIRTUAL,
  })
  storageType: AccountStorageType;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    example: 2000,
    description: "Monto inicial de la cuenta",
    required: true,
  })
  initialBalance: number;
}
