"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const account_entity_1 = require("../entities/account.entity");
const typeorm_2 = require("typeorm");
let AccountService = class AccountService {
    accountRepository;
    constructor(accountRepository) {
        this.accountRepository = accountRepository;
    }
    async create(createAccountDto) {
        if (!createAccountDto.account_type) {
            throw new common_1.BadRequestException("El tipo de cuenta es requerido.", {
                cause: new Error(),
                description: "No se está pasando el parámetro de tipo de cuenta",
            });
        }
        if (createAccountDto.account_amount === undefined ||
            createAccountDto.account_amount < 0) {
            throw new common_1.BadRequestException("El monto inicial de la cuenta es requerido y debe ser un número positivo.", {
                cause: new Error(),
                description: "No se está pasando el parámetro de monto de cuenta o es negativo",
            });
        }
        const newAccount = this.accountRepository.create({
            account_type: createAccountDto.account_type,
            account_amount: createAccountDto.account_amount,
        });
        return this.accountRepository.save(newAccount);
    }
};
exports.AccountService = AccountService;
exports.AccountService = AccountService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(account_entity_1.Account)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], AccountService);
