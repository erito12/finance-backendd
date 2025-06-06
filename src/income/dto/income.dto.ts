import { AccountType, TypeIncome } from '../income.enums';
import { ApiProperty } from '@nestjs/swagger';

export class CreateIncomeDto {
  @ApiProperty({
    example: new Date('2025-06-04T09:45:00Z'),
    description: 'Fecha del ingreso.',
  })
  income_date: Date;

  @ApiProperty({
    example: TypeIncome.SB,
    description: 'Tipo de ingreso.',
  })
  income_type: TypeIncome;

  @ApiProperty({
    example: 1000,
    description: 'Monto del ingreso.',
  })
  amount: number;

  @ApiProperty({
    example: 'efectivo',
    description: 'Cuenta asociada al ingreso.',
  })
  account_type: AccountType;
}

export class UpdateIncomeDto {
  @ApiProperty({
    example: new Date('2025-06-04T09:45:00Z'),
    description: 'Fecha del ingreso.',
    required: false,
  })
  income_date?: Date;

  @ApiProperty({
    example: TypeIncome.SB,
    description: 'Tipo de ingreso.',
    required: false,
  })
  income_type?: TypeIncome;

  @ApiProperty({
    example: 1000,
    description: 'Monto del ingreso.',
    required: false,
  })
  amount?: number;

  @ApiProperty({
    example: 'efectivo',
    description: 'Cuenta asociada al ingreso.',
    required: false,
  })
  account_type: AccountType;
}
