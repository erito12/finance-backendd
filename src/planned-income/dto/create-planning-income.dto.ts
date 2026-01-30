import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";
import { IncomeType } from "../../income/interfaces/income.interface";

export class CreateIncomePlanningDto {
  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    example: 1000,
    description: "Monto del ingreso Planificado",
    required: true,
  })
  income_planning_amount: number;

  @IsNotEmpty()
  @ApiProperty({
    example: "Pago Basico",
    description: "Monto del ingreso planificaqado",
    required: true,
  })
  income_planning_type: IncomeType;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Pago correspondiente al mes de Enero",
    description: "Descripcion del ingreso Planificado",
    required: true,
  })
  income_planning_details: string;

  @IsNumber()
  @IsNotEmpty()
  @IsPositive()
  @ApiProperty({
    example: 1,
    description: "Id de la planificacion asociada",
    required: true,
  })
  planning_id: number;
}
