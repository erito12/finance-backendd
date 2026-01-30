import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive, IsString } from "class-validator";
import { FilterDto } from "../../common/dto/filter.dto";

export class IncomeFilterDto extends FilterDto {
  @ApiProperty({
    required: false,
    description: "Filtrar por meses",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  month?: number;

  @IsOptional()
  @IsString()
  year?: string;

  @ApiProperty({
    required: false,
    description: "ID de la cuenta para filtrar ingresos",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  account_id?: number;
}
