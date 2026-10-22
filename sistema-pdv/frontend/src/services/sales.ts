import type { PaymentMethod, PosCustomer, Product } from "../domain/types"
import type { CartTotals } from "../features/pos/cart"
import { apiFetch } from "./api"
import { loadProducts } from "./products"

export interface RegisterSaleItem {
  productId: string
  name: string
  quantity: number
  unitPriceInCents: number
}

export interface RegisterSaleInput {
  items: RegisterSaleItem[]
  totals: CartTotals
  paymentMethod: PaymentMethod
  customer: PosCustomer | null
}

export interface RegisteredSale extends RegisterSaleInput {
  number: string
  date: Date
}

/** O que POST /api/sales devolve (SaleResponse do backend). */
export interface SaleResponse {
  id: string
  number: string
  status: "COMPLETED" | "CANCELED"
  paymentMethod: PaymentMethod
  subtotalInCents: number
  discountInCents: number
  totalInCents: number
  customerCpf: string | null
  sellerName: string
  createdAt: string
  items: {
    productId: string
    productName: string
    quantity: number
    unitPriceInCents: number
    totalInCents: number
  }[]
}

/** Converte a resposta do backend no formato que o PDV e o painel já usam. */
export function toRegisteredSale(response: SaleResponse): RegisteredSale {
  return {
    number: response.number,
    date: new Date(response.createdAt),
    items: response.items.map((item) => ({
      productId: item.productId,
      name: item.productName,
      quantity: item.quantity,
      unitPriceInCents: item.unitPriceInCents,
    })),
    totals: {
      subtotalInCents: response.subtotalInCents,
      discountInCents: response.discountInCents,
      totalInCents: response.totalInCents,
    },
    paymentMethod: response.paymentMethod,
    customer: response.customerCpf ? { cpf: response.customerCpf } : null,
  }
}

/**
 * Vendas registradas nesta sessão, para o painel reagir na hora.
 * TODO (Parte 3): o painel passa a ler GET /api/sales e esta lista sai.
 */
export const sales: RegisteredSale[] = []
let salesVersion = 0
const salesListeners = new Set<() => void>()

function emitSalesChanged() {
  salesVersion += 1
  salesListeners.forEach((listener) => listener())
}

export function getSalesVersion() {
  return salesVersion
}

export function subscribeSales(listener: () => void) {
  salesListeners.add(listener)
  return () => salesListeners.delete(listener)
}

function dateDaysAgo(days: number, hour: number) {
  const date = new Date()
  date.setHours(hour, 0, 0, 0)
  date.setDate(date.getDate() - days)
  return date
}

function exampleSale(
  number: string,
  daysAgo: number,
  totalInCents: number,
  paymentMethod: PaymentMethod,
): RegisteredSale {
  return {
    number,
    date: dateDaysAgo(daysAgo, 10 + (daysAgo % 6)),
    items: [],
    totals: {
      subtotalInCents: totalInCents,
      discountInCents: 0,
      totalInCents,
    },
    paymentMethod,
    customer: null,
  }
}

export const exampleSales: RegisteredSale[] = [
  exampleSale("V-0101", 0, 18990, "PIX"),
  exampleSale("V-0100", 0, 6490, "CREDIT"),
  exampleSale("V-0099", 1, 12980, "DEBIT"),
  exampleSale("V-0098", 2, 8990, "PIX"),
  exampleSale("V-0097", 3, 15980, "CASH"),
  exampleSale("V-0096", 5, 2990, "PIX"),
  exampleSale("V-0095", 6, 24990, "CREDIT"),
  exampleSale("V-0094", 12, 11990, "PIX"),
  exampleSale("V-0093", 20, 7990, "DEBIT"),
]

export type SaleStockValidation =
  { valid: true } | { valid: false; message: string }

export function validateSaleStock(
  items: readonly RegisterSaleItem[],
  inventory: readonly Product[],
): SaleStockValidation {
  const requestedByProduct = new Map<string, number>()

  for (const item of items) {
    requestedByProduct.set(
      item.productId,
      (requestedByProduct.get(item.productId) ?? 0) + item.quantity,
    )
  }

  for (const [productId, quantity] of requestedByProduct) {
    const item = items.find((candidate) => candidate.productId === productId)
    const product = inventory.find((candidate) => candidate.id === productId)

    if (!product) {
      return {
        valid: false,
        message: `Produto não encontrado: ${item?.name ?? productId}.`,
      }
    }

    if (quantity > product.stock) {
      return {
        valid: false,
        message: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}.`,
      }
    }
  }

  return { valid: true }
}

export function resetSalesForTests() {
  sales.splice(0, sales.length)
  emitSalesChanged()
}

/**
 * Registra a venda no backend: ele confere o estoque, usa o preço do banco, calcula os
 * totais, baixa o estoque e gera o número (V-0042). O frontend só manda o id e a quantidade.
 */
export async function registerSale(input: RegisterSaleInput) {
  const response = await apiFetch<SaleResponse>("/api/sales", {
    method: "POST",
    body: JSON.stringify({
      items: input.items.map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      })),
      discountInCents: input.totals.discountInCents,
      paymentMethod: input.paymentMethod,
      customerCpf: input.customer?.cpf ?? null,
    }),
  })

  const sale = toRegisteredSale(response)
  sales.push(sale)
  emitSalesChanged()

  // O backend baixou o estoque: recarrega para a busca e o painel mostrarem o saldo novo.
  void loadProducts()

  return sale
}
