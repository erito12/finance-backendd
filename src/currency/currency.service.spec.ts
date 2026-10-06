import { NotFoundException } from "@nestjs/common";
import { CurrencyService } from "./currency.service";

describe("CurrencyService", () => {
  it("should update the exchange rate for an existing currency", async () => {
    const currency = {
      currencyId: 1,
      code: "USD",
      name: "Dólar Estadounidense",
      symbol: "$",
      exchangeRate: 1,
      isCustom: false,
    };

    const repository = {
      findOneBy: jest.fn().mockResolvedValue(currency),
      save: jest.fn().mockResolvedValue({ ...currency, exchangeRate: 245.5 }),
    };

    const service = new CurrencyService(repository as any);

    const result = await service.updateExchangeRate("usd", 245.5);

    expect(repository.findOneBy).toHaveBeenCalledWith({ code: "USD" });
    expect(repository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        code: "USD",
        exchangeRate: 245.5,
      }),
    );
    expect(result.exchangeRate).toBe(245.5);
  });

  it("should throw if the currency code does not exist", async () => {
    const repository = {
      findOneBy: jest.fn().mockResolvedValue(null),
    };

    const service = new CurrencyService(repository as any);

    await expect(service.updateExchangeRate("JPY", 160)).rejects.toThrow(
      NotFoundException,
    );
  });
});
