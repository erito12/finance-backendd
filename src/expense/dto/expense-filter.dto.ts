import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive } from "class-validator";
import { FilterDto } from "../../common/dto/filter.dto";

export class ExpenseFilterDto extends FilterDto {
  @ApiProperty({
    required: false,
    description: "Filtrar por meses",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  month?: number;

  @ApiProperty({
    required: false,
    description: "ID de la cuenta para filtrar ingresos",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  account_id?: number;
}
