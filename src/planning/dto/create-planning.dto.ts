import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNotEmpty, IsNumber, IsString } from "class-validator";

export class CreatePlanningDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Planificación de Finanzas Personales",
    description: "Nombre de la planificación",
    required: true,
  })
  planning_name: string;

  @IsNumber()
  @ApiProperty({
    example: 5000,
    description: "Presupuesto inicial para la planificación",
    required: true,
  })
  initial_budget: number;

  @IsDate()
  @ApiProperty({
    example: "2025-01-01",
    description: "Fecha de inicio de la planificación",
    required: true,
  })
  start_date: Date;

  @ApiProperty({
    example: "2025-01-31",
    description: "Fecha de inicio de la planificación",
    required: true,
  })
  end_date: Date;
}
