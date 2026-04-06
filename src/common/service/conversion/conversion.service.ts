import { Injectable } from "@nestjs/common";
import { CoinsType } from "../../interface/coin-type.interface";

// conversion.service.ts

@Injectable()
export class ConversionService {
  private readonly conversionRates = {
    Efectivo: 1,
    Tarjeta: 1,
    MLC: 200, // 1 MLC = 200 Efectivo
    USD: 450, // 1 USD = 450 Efectivo
    USDT: 430, // 1 USDT = 430 Efectivo
    Clasica: 400, // 1 Clasica = 400 Efectivo
  };

  calculateExchange(amount: number, from: CoinsType, to: CoinsType): number {
    if (from === to) return amount;

    const sourceRate = this.conversionRates[from];
    const targetRate = this.conversionRates[to];

    const amountInBase = amount * sourceRate;
    const result = amountInBase / targetRate;

    return parseFloat(result.toFixed(2));
  }
}
