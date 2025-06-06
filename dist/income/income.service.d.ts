import { Repository } from 'typeorm';
import { Income } from './income.entity';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
export declare class IncomeService {
    private incomeRepository;
    constructor(incomeRepository: Repository<Income>);
    create(createIncomeDto: CreateIncomeDto): Promise<Income>;
    findAll(): Promise<Income[]>;
    findOne(income_id: number): Promise<Income | null>;
    update(id: number, updateIncomeDto: UpdateIncomeDto): Promise<Income | null>;
    remove(id: number): Promise<void>;
}
