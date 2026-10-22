import type { Product } from "../domain/types"
import { apiFetch } from "./api"

/** O que GET /api/products devolve (ProductResponse do backend). */
export interface ProductResponse {
  id: string
  barcode: string
  name: string
  priceInCents: number
  stockQuantity: number
  minStock: number
  active: boolean
  version: number
  belowMinStock: boolean
  createdAt: string
  updatedAt: string
}

export type ProductsStatus = "IDLE" | "LOADING" | "READY" | "ERROR"

/** Único lugar que traduz os nomes do backend para os do frontend. */
export function toProduct(response: ProductResponse): Product {
  return {
    id: response.id,
    barcode: response.barcode,
    name: response.name,
    priceInCents: response.priceInCents,
    stock: response.stockQuantity,
    minStock: response.minStock,
  }
}

/**
 * Produtos ativos vindos da API, guardados em memória para a busca do PDV ser
 * instantânea (o leitor de código de barras não espera rede).
 */
export const products: Product[] = []

let status: ProductsStatus = "IDLE"
let errorMessage = ""
let pendingLoad: Promise<void> | null = null
let productsVersion = 0
const productListeners = new Set<() => void>()

function emitProductsChanged() {
  productsVersion += 1
  productListeners.forEach((listener) => listener())
}

export function getProductsVersion() {
  return productsVersion
}

export function getProductsStatus() {
  return status
}

export function getProductsError() {
  return errorMessage
}

export function subscribeProducts(listener: () => void) {
  productListeners.add(listener)
  return () => productListeners.delete(listener)
}

/** Busca os produtos no backend. Chamadas simultâneas reaproveitam a mesma requisição. */
export function loadProducts(): Promise<void> {
  if (pendingLoad) return pendingLoad

  status = "LOADING"
  errorMessage = ""
  emitProductsChanged()

  pendingLoad = apiFetch<ProductResponse[]>("/api/products")
    .then((response) => {
      products.splice(0, products.length, ...response.map(toProduct))
      status = "READY"
    })
    .catch((error: unknown) => {
      status = "ERROR"
      errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os produtos."
    })
    .finally(() => {
      pendingLoad = null
      emitProductsChanged()
    })

  return pendingLoad
}

/** Registra a entrada no backend e atualiza o produto em memória com a resposta. */
export async function restockProduct(productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      "A quantidade recebida deve ser um número inteiro positivo.",
    )
  }

  const response = await apiFetch<ProductResponse>(
    `/api/products/${productId}/restock`,
    { method: "POST", body: JSON.stringify({ quantity }) },
  )

  const updated = toProduct(response)
  const index = products.findIndex((product) => product.id === productId)
  if (index >= 0) products[index] = updated
  emitProductsChanged()
  return updated
}

/**
 * Baixa o estoque só em memória, para a tela refletir a venda simulada.
 * TODO (Parte 2): sai quando a venda chamar POST /api/sales; aí é só recarregar os produtos.
 */
export function decreaseProductStock(productId: string, quantity: number) {
  const product = products.find((candidate) => candidate.id === productId)

  if (!product || quantity <= 0 || quantity > product.stock) {
    throw new Error("Não foi possível baixar o estoque do produto.")
  }

  product.stock -= quantity
  emitProductsChanged()
  return product
}

export function resetProductsForTests(initialProducts: Product[] = []) {
  products.splice(
    0,
    products.length,
    ...initialProducts.map((product) => ({ ...product })),
  )
  status = initialProducts.length > 0 ? "READY" : "IDLE"
  errorMessage = ""
  pendingLoad = null
  emitProductsChanged()
}
