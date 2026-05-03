import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  IsNumber,
  IsBoolean,
  IsOptional,
  Length,
  Min,
} from "class-validator";

export class UpdateCurrencyDto {
  @ApiProperty({
    description: "Currency code (e.g., USD, EUR)",
    example: "USD",
    minLength: 3,
    maxLength: 3,
  })
  @IsString()
  @Length(3, 3)
  code: string;

  @ApiProperty({
    description: "Currency name",
    example: "US Dollar",
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: "Currency symbol",
    example: "$",
  })
  @IsString()
  symbol: string;

  @ApiProperty({
    description: "Exchange rate",
    example: 1.0,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  exchangeRate?: number;

  @ApiProperty({
    description: "Is currency active",
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
