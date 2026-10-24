import { describe, expect, it } from "vitest"
import type { Product } from "../../domain/types"
import { moveProductSelection, searchProducts } from "./productSearch"

const catalog: Product[] = [
  {
    id: "cable-usbc",
    barcode: "7891",
    name: "Cabo USB-C",
    priceInCents: 2990,
    stock: 10,
    minStock: 2,
  },
  {
    id: "cable-lightning",
    barcode: "7892",
    name: "Cabo Lightning",
    priceInCents: 3990,
    stock: 8,
    minStock: 2,
  },
  {
    id: "charger",
    barcode: "7893",
    name: "Carregador rápido",
    priceInCents: 8990,
    stock: 5,
    minStock: 2,
  },
]

describe("searchProducts", () => {
  it("returns an exact barcode match directly", () => {
    expect(searchProducts(catalog, "7892")).toEqual({
      type: "DIRECT",
      product: catalog[1],
    })
  })

  it("finds internal codes with letters, in any case", () => {
    const withInternalCode = [
      ...catalog,
      {
        id: "case",
        barcode: "CAP20",
        name: "Capinha",
        priceInCents: 2000,
        stock: 3,
        minStock: 1,
      },
    ]

    for (const typed of ["CAP20", "cap20", " Cap20 "]) {
      expect(searchProducts(withInternalCode, typed)).toEqual({
        type: "DIRECT",
        product: withInternalCode[3],
      })
    }
  })

  it("returns multiple partial name matches", () => {
    expect(searchProducts(catalog, "cabo")).toEqual({
      type: "MULTIPLE",
      products: [catalog[0], catalog[1]],
    })
  })

  it("returns a single name match directly", () => {
    expect(searchProducts(catalog, "carregador")).toEqual({
      type: "DIRECT",
      product: catalog[2],
    })
  })

  it("returns empty when no product matches", () => {
    expect(searchProducts(catalog, "inexistente")).toEqual({
      type: "EMPTY",
    })
  })
})

describe("moveProductSelection", () => {
  it("cycles forward and backward through results", () => {
    expect(moveProductSelection(0, "NEXT", 2)).toBe(1)
    expect(moveProductSelection(1, "NEXT", 2)).toBe(0)
    expect(moveProductSelection(0, "PREVIOUS", 2)).toBe(1)
  })
})
