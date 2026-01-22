import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";
import { IncomeType } from "../../income/interfaces/income.interface";

export class UpdateIncomePlanningDto {
  @IsString()
  @ApiProperty({
    example: "Vianda",
    description: "Nombre del gasto planificaqado",
    required: false,
  })
  title_income: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso Planificado",
    required: false,
  })
  income_type: IncomeType;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1,
    description: "Id de la planificacion asociada",
    required: false,
  })
  planning_id: number;
}
