import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CurrencyEntity } from "../../../entities/currency.entity";

@Injectable()
export class ConversionService {
  constructor(
    @InjectRepository(CurrencyEntity)
    private readonly currencyRepository: Repository<CurrencyEntity>,
  ) {}

  async calculateExchange(
    amount: number,
    fromCode: string,
    toCode: string,
  ): Promise<number> {
    if (fromCode === toCode) return amount;

    const [source, target] = await Promise.all([
      this.currencyRepository.findOneBy({ code: fromCode }),
      this.currencyRepository.findOneBy({ code: toCode }),
    ]);

    if (!source || !target) {
      throw new NotFoundException("Monedas no encontradas para la conversión.");
    }

    // 1. Convertimos el monto de la moneda origen a CUP (Nueva Moneda Base)
    // Ejemplo: 2 USD * 450 (tasa USD) = 900 CUP
    const amountInCUP = amount * source.exchangeRate;

    // 2. Convertimos de CUP a la moneda destino
    // Ejemplo: 900 CUP / 200 (tasa MLC) = 4.50 MLC
    const result = amountInCUP / target.exchangeRate;

    return parseFloat(result.toFixed(2));
  }
}
