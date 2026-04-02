import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsPositive, IsString } from "class-validator";

export class CreateDistributionDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "gasto operativo",
    description: "Tipo de distribución",
    required: true,
  })
  distribution_type: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: "Pago de servicios básicos",
    description: "Detalles de la distribución",
    required: true,
  })
  distribution_details: string;

  @IsNumber()
  @IsPositive()
  @ApiProperty({
    example: 20,
    description: "Monto de la distribución",
    required: true,
  })
  distribution_amount: number;
}
