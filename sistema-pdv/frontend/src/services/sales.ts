import type { PaymentMethod, PosCustomer, Product } from "../domain/types"
import type { CartTotals } from "../features/pos/cart"
import { decreaseProductStock, products } from "./products"

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
  date?: Date
}

export interface RegisteredSale extends RegisterSaleInput {
  number: string
  date: Date
}

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

export function registerSale(input: RegisterSaleInput) {
  const stockValidation = validateSaleStock(input.items, products)

  if (!stockValidation.valid) {
    throw new Error(stockValidation.message)
  }

  for (const item of input.items) {
    decreaseProductStock(item.productId, item.quantity)
  }

  const sale: RegisteredSale = {
    ...input,
    number: `V-${String(sales.length + 1).padStart(4, "0")}`,
    date: input.date ?? new Date(),
    items: input.items.map((item) => ({ ...item })),
    totals: { ...input.totals },
    customer: input.customer ? { ...input.customer } : null,
  }

  sales.push(sale)
  emitSalesChanged()
  return sale
}
