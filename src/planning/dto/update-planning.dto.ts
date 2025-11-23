import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsString } from "class-validator";

export class UpdatePlanningDto {
  @IsString()
  @ApiProperty({
    example: "Planificación de Finanzas Personales",
    description: "Nombre de la planificación",
    required: false,
  })
  planning_name: string;

  @IsNumber()
  @ApiProperty({
    example: 5000,
    description: "Presupuesto inicial para la planificación",
    required: false,
  })
  initial_budget: number;

  @IsDate()
  @ApiProperty({
    example: "2025-01-01",
    description: "Fecha de inicio de la planificación",
    required: false,
  })
  start_date: Date;

  @IsDate()
  @ApiProperty({
    example: "2025-01-31",
    description: "Fecha de inicio de la planificación",
    required: false,
  })
  end_date: Date;
}
