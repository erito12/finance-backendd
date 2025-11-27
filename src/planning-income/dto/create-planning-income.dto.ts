import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive } from "class-validator";
import { IncomeType } from "../../income/interfaces/income.interface";

export class CreatePlanningIncomeDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: "Pago Basico",
    description: "Monto del ingreso planificaqado",
    required: true,
  })
  income_planning_amount: number;

  @IsNumber()
  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso Planificado",
    required: true,
  })
  income_planning_type: IncomeType;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 1,
    description: "Id de la planificacion asociada",
    required: true,
  })
  planning_id: number;
}
