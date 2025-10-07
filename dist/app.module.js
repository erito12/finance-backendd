"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const income_module_1 = require("./income/income.module");
const income_entity_1 = require("./entities/income.entity");
const account_module_1 = require("./account/account.module");
const account_entity_1 = require("./entities/account.entity");
const typeOrmConfig = {
    type: "sqlite",
    database: "finance.db",
    entities: [income_entity_1.Income, account_entity_1.Account],
    synchronize: true,
};
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forRoot(typeOrmConfig), income_module_1.IncomeModule, account_module_1.AccountModule],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map