import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

import { CreateIncomeDto, UpdateIncomeDto } from "./dto/income.dto";
import { Income } from "src/entities/income.entity";
import { AccountService } from "src/account/account.service";

@Injectable()
export class IncomeService {
  constructor(
    @InjectRepository(Income)
    private incomeRepository: Repository<Income>,
    private accountService: AccountService,
  ) {}

  async create(createIncomeDto: CreateIncomeDto): Promise<Income> {
    const accountExists = await this.accountService.getById(
      createIncomeDto.account_id,
    );
    if (!accountExists) {
      throw new BadRequestException(
        "La cuenta con el ID proporcionado no existe.",
      );
    }
    if (!createIncomeDto.amount) {
      throw new BadRequestException("La cantidad es requerida.");
    } else if (!createIncomeDto.details) {
      throw new BadRequestException("Los detalles son necesarios");
    } else if (!createIncomeDto.income_type) {
      throw new BadRequestException("El tipo de ingreso es necesario");
    }
    const newIngreso = this.incomeRepository.create(createIncomeDto);
    return this.incomeRepository.save(newIngreso);
  }

  async findAll(): Promise<Income[]> {
    return this.incomeRepository.find({ relations: ["account"] });
  }

  async findOne(income_id: number): Promise<Income | null> {
    return this.incomeRepository.findOne({
      where: { income_id },
      relations: ["account"],
    });
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

  async removeById(id: number): Promise<void> {
    if (!this.incomeRepository) {
      throw new BadRequestException("No existen datos que borrar");
    } else await this.incomeRepository.delete(id);
  }

  async removeAll(): Promise<void> {
    await this.incomeRepository.deleteAll();
  }
}
