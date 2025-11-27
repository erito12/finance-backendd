import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsPositive, IsString } from "class-validator";
import { IncomeType } from "../../income/interfaces/income.interface";

export class UpdatePlanningIncomeDto {
  @IsString()
  @ApiProperty({
    example: "Vianda",
    description: "Nombre del gasto planificaqado",
    required: true,
  })
  title_income: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso Planificado",
    required: true,
  })
  income_type: IncomeType;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1,
    description: "Id de la planificacion asociada",
    required: true,
  })
  planning_id: number;
}
