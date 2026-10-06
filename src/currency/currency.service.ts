import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CurrencyEntity } from "../entities/currency.entity";
import { INITIAL_CURRENCIES } from "../common/enum/AccountStorageType";

@Injectable()
export class CurrencyService implements OnModuleInit {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async findAll(): Promise<CurrencyEntity[]> {
    return this.currencyRepository.find();
  }

  async findByCode(code: string): Promise<CurrencyEntity | null> {
    return this.currencyRepository.findOneBy({ code: code.toUpperCase() });
  }

  async updateExchangeRate(
    code: string,
    exchangeRate: number,
  ): Promise<CurrencyEntity> {
    if (!Number.isFinite(exchangeRate) || exchangeRate < 0) {
      throw new BadRequestException(
        "El valor de la moneda debe ser un número válido y mayor o igual a 0.",
      );
    }

    const normalizedCode = code.toUpperCase();
    const currency = await this.findByCode(normalizedCode);

    if (!currency) {
      throw new NotFoundException(
        `No existe la moneda con el código ${normalizedCode}.`,
      );
    }

    currency.exchangeRate = Number(exchangeRate);
    return this.currencyRepository.save(currency);
  }

  //Metodos alternativos para manejar las monedas, como obtener todas las monedas, obtener una moneda por su código, etc. pueden ser añadidos aquí.
  // Este método se ejecuta al arrancar la aplicación
  async onModuleInit() {
    await this.seedCurrencies();
  }

  private async seedCurrencies() {
    // 1. Contamos cuántas monedas hay en la base de datos
    const count = await this.currencyRepository.count();

    // 2. Si el conteo es 0, significa que la tabla está vacía
    if (count === 0) {
      console.log("--- Iniciando carga masiva de monedas (Seeding) ---");

      const currencies = this.currencyRepository.create(INITIAL_CURRENCIES);
      await this.currencyRepository.save(currencies);

      console.log("--- Monedas iniciales cargadas con éxito ---");
    }
  }
}
