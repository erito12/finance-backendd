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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateIncomeDto = exports.CreateIncomeDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class CreateIncomeDto {
    income_type;
    details;
    amount;
}
exports.CreateIncomeDto = CreateIncomeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Pago por Resultado",
        description: "Tipo de ingreso.",
    }),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "income_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Pago del mes de actual",
        description: "Detalles del Ingreso",
    }),
    __metadata("design:type", String)
], CreateIncomeDto.prototype, "details", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1000,
        description: "Monto del ingreso.",
    }),
    __metadata("design:type", Number)
], CreateIncomeDto.prototype, "amount", void 0);
class UpdateIncomeDto {
    income_type;
    amount;
    details;
}
exports.UpdateIncomeDto = UpdateIncomeDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Pago por Resultado",
        description: "Tipo de ingreso.",
        required: false,
    }),
    __metadata("design:type", String)
], UpdateIncomeDto.prototype, "income_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 1000,
        description: "Monto del ingreso.",
        required: false,
    }),
    __metadata("design:type", Number)
], UpdateIncomeDto.prototype, "amount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: "Pago del mes de actual",
        description: "Detalles del Ingreso",
    }),
    __metadata("design:type", String)
], UpdateIncomeDto.prototype, "details", void 0);
