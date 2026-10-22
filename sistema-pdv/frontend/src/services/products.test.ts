import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  getProductsError,
  getProductsStatus,
  loadProducts,
  products,
  resetProductsForTests,
  restockProduct,
  subscribeProducts,
  type ProductResponse,
} from "./products"

const cableResponse: ProductResponse = {
  id: "3f2a9c1e-0000-4000-8000-000000000001",
  barcode: "7891000000011",
  name: "Cabo USB-C",
  priceInCents: 2990,
  stockQuantity: 4,
  minStock: 5,
  active: true,
  version: 0,
  belowMinStock: true,
  createdAt: "2026-10-22T12:00:00Z",
  updatedAt: "2026-10-22T12:00:00Z",
}

function mockFetch(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(body), {
      status,
      headers: { "Content-Type": "application/json" },
    }),
  )
  vi.stubGlobal("fetch", fetchMock)
  // Os testes rodam no Node (sem navegador): o apiFetch lê o token CSRF do document.cookie.
  vi.stubGlobal("document", { cookie: "XSRF-TOKEN=token-de-teste" })
  return fetchMock
}

describe("loadProducts", () => {
  beforeEach(() => resetProductsForTests())
  afterEach(() => vi.unstubAllGlobals())

  it("loads products from the API and renames stockQuantity to stock", async () => {
    const fetchMock = mockFetch(200, [cableResponse])

    await loadProducts()

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/products",
      expect.objectContaining({ credentials: "same-origin" }),
    )
    expect(getProductsStatus()).toBe("READY")
    expect(products).toEqual([
      {
        id: cableResponse.id,
        barcode: "7891000000011",
        name: "Cabo USB-C",
        priceInCents: 2990,
        stock: 4,
        minStock: 5,
      },
    ])
  })

  it("keeps the backend message when loading fails", async () => {
    mockFetch(401, { message: "Faça login para continuar." })

    await loadProducts()

    expect(getProductsStatus()).toBe("ERROR")
    expect(getProductsError()).toBe("Faça login para continuar.")
  })

  it("reuses the same request when called twice at once", async () => {
    const fetchMock = mockFetch(200, [])

    await Promise.all([loadProducts(), loadProducts()])

    expect(fetchMock).toHaveBeenCalledOnce()
  })
})

describe("restockProduct", () => {
  beforeEach(() =>
    resetProductsForTests([
      {
        id: cableResponse.id,
        barcode: cableResponse.barcode,
        name: cableResponse.name,
        priceInCents: 2990,
        stock: 4,
        minStock: 5,
      },
    ]),
  )
  afterEach(() => vi.unstubAllGlobals())

  it("sends the quantity and updates the product with the API response", async () => {
    const fetchMock = mockFetch(200, { ...cableResponse, stockQuantity: 11 })
    const listener = vi.fn()
    const unsubscribe = subscribeProducts(listener)

    await restockProduct(cableResponse.id, 7)

    expect(fetchMock).toHaveBeenCalledWith(
      `/api/products/${cableResponse.id}/restock`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ quantity: 7 }),
      }),
    )
    expect(products[0].stock).toBe(11)
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it("rejects invalid quantities without calling the API", async () => {
    const fetchMock = mockFetch(200, cableResponse)

    await expect(restockProduct(cableResponse.id, 0)).rejects.toThrow(
      "número inteiro positivo",
    )
    await expect(restockProduct(cableResponse.id, 1.5)).rejects.toThrow(
      "número inteiro positivo",
    )
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("passes on the backend error and keeps the stock", async () => {
    mockFetch(404, { message: "Produto não encontrado." })

    await expect(restockProduct(cableResponse.id, 3)).rejects.toThrow(
      "Produto não encontrado.",
    )
    expect(products[0].stock).toBe(4)
  })
})
