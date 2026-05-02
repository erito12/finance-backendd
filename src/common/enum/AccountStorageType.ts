export enum AccountStorageType {
  PHYSICAL = "FISICA", // Efectivo, billetera física
  VIRTUAL = "VIRTUAL", // Tarjetas (Clásica, AIS, Metropolitano), PayPal
  CRYPTO = "CRYPTO", // Binance, Trust Wallet
  PLATFORM = "PLATFORM", // Saldo en una web, etc.
}

export const INITIAL_CURRENCIES = [
  { code: "CUP", name: "Peso Cubano", symbol: "₱" },
  { code: "USD", name: "Dólar Estadounidense", symbol: "$" },
  { code: "MLC", name: "MLC", symbol: "$" },
  { code: "USDT", name: "Tether", symbol: "₮" },
  { code: "EUR", name: "Euro", symbol: "€" },
];
