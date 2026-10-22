export interface Product {
  id: string
  barcode: string
  name: string
  priceInCents: number
  stock: number
  minStock: number
}

/** Só o CPF na nota: o backend não guarda nome (o cadastro de clientes vem depois). */
export interface PosCustomer {
  cpf: string
}

export type PaymentMethod = "CASH" | "PIX" | "DEBIT" | "CREDIT"
