import { IncomeService } from "./income.service";
import { CreateIncomeDto, UpdateIncomeDto } from "./dto/income.dto";
export declare class IncomeController {
    private readonly incomeService;
    constructor(incomeService: IncomeService);
    create(createIncomeDto: CreateIncomeDto): Promise<Income>;
    findAll(): Promise<Income[]>;
    findOne(id: number): Promise<any>;
    update(id: number, updateIncomeDto: UpdateIncomeDto): Promise<any>;
    remove(id: number): Promise<void>;
}
