import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsOptional, IsPositive } from "class-validator";

export class FilterDto {
  @ApiProperty({
    required: false,
    description: "Número de resultados por página",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  limit?: number = 10;

  @ApiProperty({
    required: false,
    description: "Número de página para paginación",
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  page?: number = 1;
}
