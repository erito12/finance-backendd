import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateIncomeDto, UpdateIncomeDto } from "./dto/income.dto";
import { Income } from "src/entities/income.entity";

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    if (!createIncomeDto.amount) {
      throw new BadRequestException("La cantidad es requerida.");
    } else if (!createIncomeDto.details) {
      throw new BadRequestException("Los detalles son necesarios");
    } else if (!createIncomeDto.income_type) {
      throw new BadRequestException("El tipo de cuenta es necesario");
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
