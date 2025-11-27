export interface incomeInterface {
  income_id: string;
  income_type: IncomeType;
  details: string;
  amount: number;
  income_date: Date;
}

export type IncomeType =
  | "Salario Basico"
  | "Pago por Resultado"
  | "Venta de Producto"
  | "Cobro de Deuda"
  | "Pago Trimestral"
  | "Pago Anual"
  | "Indennizacion"
  | "Licencia de Maternidad"
  | "Otro";
