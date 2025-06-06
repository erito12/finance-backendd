import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Income } from './income.entity';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    if (!createIncomeDto.account_type) {
      throw new BadRequestException('La cuenta es requerida.');
    }
    const newIngreso = this.incomeRepository.create(createIncomeDto);
    return this.incomeRepository.save(newIngreso);
  }

  async findAll(): Promise<Income[]> {
    return this.incomeRepository.find();
  }

  async findOne(income_id: number): Promise<Income | null> {
    return this.incomeRepository.findOneBy({ income_id });
  }

  async update(
    id: number,
    updateIncomeDto: UpdateIncomeDto,
  ): Promise<Income | null> {
    const existingIncome = await this.findOne(id);
    if (!existingIncome) {
      return null;
    }
    await this.incomeRepository.update(id, updateIncomeDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.incomeRepository.delete(id);
  }
}
