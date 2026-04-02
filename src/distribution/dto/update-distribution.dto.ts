import { ApiProperty } from "@nestjs/swagger";

export class UpdateDistributionDto {
  @ApiProperty({
    example: "gasto operativo",
    description: "Tipo de distribución",
    required: false,
  })
  distribution_type?: string;

  @ApiProperty({
    example: "Pago de servicios básicos",
    description: "Detalles de la distribución",
    required: false,
  })
  distribution_details?: string;

  @ApiProperty({
    example: 125.5,
    description: "Monto de la distribución",
    required: false,
  })
  distribution_amount?: number;
}
