import { IncomeService } from './income.service';
import { CreateIncomeDto, UpdateIncomeDto } from './dto/income.dto';
export declare class IncomeController {
    private readonly incomeService;
    constructor(incomeService: IncomeService);
    create(createIncomeDto: CreateIncomeDto): Promise<import("./income.entity").Income>;
    findAll(): Promise<import("./income.entity").Income[]>;
    findOne(id: number): Promise<import("./income.entity").Income>;
    update(id: number, updateIncomeDto: UpdateIncomeDto): Promise<import("./income.entity").Income>;
    remove(id: number): Promise<void>;
}
