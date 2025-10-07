export interface incomeInterface {
    income_id: string;
    income_type: TypeIncome;
    details: string;
}
export type TypeIncome = "Salario Basico" | "Pago por Resultado" | "Venta de Producto" | "Cobro de Deuda" | "Pago Trimestral";
export type AccountType = "efectivo" | "tarjeta personal" | "tarjeta de ahorro";
