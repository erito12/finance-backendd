export interface incomeInterface {
  income_id: string;
  income_type: TypeIncome;
  details: string;
  amount: number;
  income_date: Date;
}

export type TypeIncome =
  | "Salario Basico"
  | "Pago por Resultado"
  | "Venta de Producto"
  | "Cobro de Deuda"
  | "Pago Trimestral";
