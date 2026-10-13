import { describe, expect, it } from "vitest"
import type { Product } from "../../domain/types"
import {
  addCartItem,
  calculateCartTotals,
  canFinalizeSale,
  removeCartItem,
} from "./cart"

const product: Product = {
  id: "product-1",
  barcode: "789000000001",
  name: "Cabo USB-C reforçado",
  priceInCents: 2590,
  stock: 10,
  minStock: 2,
}

describe("cart", () => {
  it("adds an item using integer cents", () => {
    const cart = addCartItem([], product)

    expect(cart).toEqual([{ product, quantity: 1 }])
    expect(calculateCartTotals(cart)).toEqual({
      subtotalInCents: 2590,
      discountInCents: 0,
      totalInCents: 2590,
    })
  })

  it("adds the quantity when the same product is scanned again", () => {
    const firstScan = addCartItem([], product, 2)
    const secondScan = addCartItem(firstScan, product, 3)

    expect(secondScan).toEqual([{ product, quantity: 5 }])
    expect(calculateCartTotals(secondScan).subtotalInCents).toBe(12950)
  })

  it("removes an item by product id", () => {
    const anotherProduct: Product = {
      ...product,
      id: "product-2",
      barcode: "789000000002",
      name: "Película de vidro",
    }
    const cart = addCartItem(addCartItem([], product), anotherProduct)

    expect(removeCartItem(cart, product.id)).toEqual([
      { product: anotherProduct, quantity: 1 },
    ])
  })

  it("does not add more units than the available stock", () => {
    const cart = addCartItem([], product, 8)
    const updatedCart = addCartItem(cart, product, 5)

    expect(updatedCart[0].quantity).toBe(10)
  })

  it("limits a discount greater than the subtotal and never returns a negative total", () => {
    const totals = calculateCartTotals(addCartItem([], product), 10000)

    expect(totals).toEqual({
      subtotalInCents: 2590,
      discountInCents: 2590,
      totalInCents: 0,
    })
  })
})

describe("canFinalizeSale", () => {
  it("does not allow an empty cart", () => {
    expect(canFinalizeSale([])).toBe(false)
  })

  it("does not allow a cart with a zero total", () => {
    const cart = addCartItem([], product)

    expect(canFinalizeSale(cart, product.priceInCents)).toBe(false)
  })

  it("allows a cart with items and a positive total", () => {
    const cart = addCartItem([], product)

    expect(canFinalizeSale(cart)).toBe(true)
  })
})
