import { Body, Controller, Post } from "@nestjs/common";
import { ExpensePlanningService } from "./expense-planing.service";
import { CreateExpensePlanningDto } from "./dto/createExpensePlanning.dto";

@Controller("planned-expend")
export class PlannedExpendController {
  constructor(
    private readonly expensePlanningService: ExpensePlanningService,
  ) {}

  @Post()
  async create(@Body() createExpensePlanningDto: CreateExpensePlanningDto) {
    return this.expensePlanningService.create(createExpensePlanningDto);
  }
}
