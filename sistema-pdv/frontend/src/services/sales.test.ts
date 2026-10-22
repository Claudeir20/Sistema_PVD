import { beforeEach, describe, expect, it, vi } from "vitest"
import type { Product } from "../domain/types"
import { products, resetProductsForTests } from "./products"
import {
  registerSale,
  resetSalesForTests,
  sales,
  subscribeSales,
  validateSaleStock,
} from "./sales"

// A venda ainda é simulada e baixa o estoque em memória (Parte 2 liga à API).
const exampleProducts: Product[] = [
  {
    id: "cable-usbc",
    barcode: "7891000000011",
    name: "Cabo USB-C reforçado",
    priceInCents: 2990,
    stock: 18,
    minStock: 5,
  },
  {
    id: "screen-protector",
    barcode: "7891000000028",
    name: "Película de vidro 6,1”",
    priceInCents: 3990,
    stock: 4,
    minStock: 6,
  },
]

describe("registerSale", () => {
  beforeEach(() => {
    resetProductsForTests(exampleProducts)
    resetSalesForTests()
  })

  it("records all sale data and decreases stock", () => {
    const product = products[0]
    const initialStock = product.stock
    const date = new Date("2026-03-12T10:00:00.000Z")

    const sale = registerSale({
      items: [
        {
          productId: product.id,
          name: product.name,
          quantity: 2,
          unitPriceInCents: product.priceInCents,
        },
      ],
      totals: {
        subtotalInCents: 5980,
        discountInCents: 0,
        totalInCents: 5980,
      },
      paymentMethod: "PIX",
      customer: { cpf: "52998224725", name: "Maria" },
      date,
    })

    expect(sale).toMatchObject({
      number: "V-0001",
      paymentMethod: "PIX",
      customer: { cpf: "52998224725", name: "Maria" },
      date,
    })
    expect(product.stock).toBe(initialStock - 2)
    expect(sales).toHaveLength(1)
  })

  it("notifies subscribers after registering a sale", () => {
    const product = products[0]
    const listener = vi.fn()
    const unsubscribe = subscribeSales(listener)

    registerSale({
      items: [
        {
          productId: product.id,
          name: product.name,
          quantity: 1,
          unitPriceInCents: product.priceInCents,
        },
      ],
      totals: {
        subtotalInCents: product.priceInCents,
        discountInCents: 0,
        totalInCents: product.priceInCents,
      },
      paymentMethod: "CASH",
      customer: null,
    })

    expect(listener).toHaveBeenCalledOnce()
    unsubscribe()
  })

  it("rejects quantities above stock without changing inventory", () => {
    const product = products[0]
    const initialStock = product.stock

    expect(() =>
      registerSale({
        items: [
          {
            productId: product.id,
            name: product.name,
            quantity: initialStock + 1,
            unitPriceInCents: product.priceInCents,
          },
        ],
        totals: {
          subtotalInCents: product.priceInCents * (initialStock + 1),
          discountInCents: 0,
          totalInCents: product.priceInCents * (initialStock + 1),
        },
        paymentMethod: "CASH",
        customer: null,
      }),
    ).toThrow("Estoque insuficiente")

    expect(product.stock).toBe(initialStock)
    expect(sales).toHaveLength(0)
  })

  it("validates all item stock before registration", () => {
    const availableProduct = products[0]
    const unavailableProduct = products[1]

    const validation = validateSaleStock(
      [
        {
          productId: availableProduct.id,
          name: availableProduct.name,
          quantity: 1,
          unitPriceInCents: availableProduct.priceInCents,
        },
        {
          productId: unavailableProduct.id,
          name: unavailableProduct.name,
          quantity: unavailableProduct.stock + 1,
          unitPriceInCents: unavailableProduct.priceInCents,
        },
      ],
      products,
    )

    expect(validation).toEqual({
      valid: false,
      message: `Estoque insuficiente para ${unavailableProduct.name}. Disponível: ${unavailableProduct.stock}.`,
    })
  })
})
