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

/** O que GET /api/sales devolve: o resumo de cada venda, sem os itens. */
export interface SaleSummaryResponse {
  id: string
  number: string
  status: "COMPLETED" | "CANCELED"
  paymentMethod: PaymentMethod
  totalInCents: number
  createdAt: string
}

/** Venda no formato do painel: o suficiente para faturamento, contagem e gráfico. */
export interface SaleSummary {
  id: string
  number: string
  canceled: boolean
  paymentMethod: PaymentMethod
  date: Date
  totals: { totalInCents: number }
}

export function toSaleSummary(response: SaleSummaryResponse): SaleSummary {
  return {
    id: response.id,
    number: response.number,
    canceled: response.status === "CANCELED",
    paymentMethod: response.paymentMethod,
    date: new Date(response.createdAt),
    totals: { totalInCents: response.totalInCents },
  }
}

/** Vendas de um período (datas AAAA-MM-DD, dias inteiros). Só ADMIN. */
export async function fetchSalesByPeriod(from: string, to: string) {
  const params = new URLSearchParams({ from, to })
  const response = await apiFetch<SaleSummaryResponse[]>(`/api/sales?${params}`)
  return response.map(toSaleSummary)
}

/** Avisa o painel que uma venda foi registrada nesta aba, para ele buscar de novo. */
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
  emitSalesChanged()

  // O backend baixou o estoque: recarrega para a busca e o painel mostrarem o saldo novo.
  void loadProducts()

  return sale
}

/** Detalhe de uma venda: itens, vendedor, CPF e totais. */
export function fetchSaleById(saleId: string) {
  return apiFetch<SaleResponse>(`/api/sales/${saleId}`)
}

/**
 * Cancela a venda inteira (só ADMIN): o backend devolve os itens ao estoque.
 * Recarrega os produtos para o PDV ver o estoque de volta e avisa o painel.
 */
export async function cancelSale(saleId: string) {
  const canceled = await apiFetch<SaleResponse>(`/api/sales/${saleId}/cancel`, {
    method: "POST",
  })
  void loadProducts()
  emitSalesChanged()
  return canceled
}
