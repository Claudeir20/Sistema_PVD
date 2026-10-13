import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  products,
  resetProductsForTests,
  restockProduct,
  subscribeProducts,
} from "./products"

describe("restockProduct", () => {
  beforeEach(() => {
    resetProductsForTests()
  })

  it("increases stock and notifies subscribers", () => {
    const product = products[0]
    const initialStock = product.stock
    const listener = vi.fn()
    const unsubscribe = subscribeProducts(listener)

    restockProduct(product.id, 7)

    expect(product.stock).toBe(initialStock + 7)
    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it("rejects invalid quantities", () => {
    expect(() => restockProduct(products[0].id, 0)).toThrow(
      "número inteiro positivo",
    )
    expect(() => restockProduct(products[0].id, 1.5)).toThrow(
      "número inteiro positivo",
    )
  })

  it("rejects an unknown product", () => {
    expect(() => restockProduct("missing", 3)).toThrow("Produto não encontrado")
  })
})
