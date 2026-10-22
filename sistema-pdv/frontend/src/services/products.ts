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

// --- Cadastro de produtos (tela do admin) ---

export interface ProductFormData {
  barcode: string
  name: string
  priceInCents: number
  minStock: number
}

export type StockMovementType =
  "ENTRY" | "EXIT" | "ADJUSTMENT" | "SALE" | "SALE_CANCELLATION"

/** Uma linha do histórico de estoque (GET /api/products/{id}/movements). */
export interface ProductMovement {
  movementId: string
  type: StockMovementType
  date: string
  observation: string | null
  quantity: number
  balanceAfter: number
}

/**
 * A tela do admin trabalha com a resposta completa (precisa da version para editar).
 * Depois de cada mudança, recarrega também o cache do PDV.
 */
export function fetchProductResponses() {
  return apiFetch<ProductResponse[]>("/api/products")
}

export async function createProduct(data: ProductFormData) {
  const created = await apiFetch<ProductResponse>("/api/products", {
    method: "POST",
    body: JSON.stringify(data),
  })
  void loadProducts()
  return created
}

/** O código de barras não muda; a version evita sobrescrever a edição de outra pessoa. */
export async function updateProduct(
  productId: string,
  data: Omit<ProductFormData, "barcode">,
  version: number,
) {
  const updated = await apiFetch<ProductResponse>(
    `/api/products/${productId}`,
    { method: "PUT", body: JSON.stringify({ ...data, version }) },
  )
  void loadProducts()
  return updated
}

export async function archiveProduct(productId: string) {
  const archived = await apiFetch<ProductResponse>(
    `/api/products/${productId}/archive`,
    { method: "POST" },
  )
  void loadProducts()
  return archived
}

export function fetchProductMovements(productId: string) {
  return apiFetch<ProductMovement[]>(`/api/products/${productId}/movements`)
}

/**
 * Contagem física: o estoque passa a ser exatamente o contado, e a diferença fica
 * no histórico com o motivo (ex.: "Contagem mensal", "Avaria").
 */
export async function adjustProductStock(
  productId: string,
  countedQuantity: number,
  reason: string,
) {
  const adjusted = await apiFetch<ProductResponse>(
    `/api/products/${productId}/adjust`,
    { method: "POST", body: JSON.stringify({ countedQuantity, reason }) },
  )
  void loadProducts()
  return adjusted
}
