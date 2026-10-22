import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Product } from "../domain/types"
import { resetProductsForTests } from "./products"
import {
  registerSale,
  resetSalesForTests,
  sales,
  subscribeSales,
  validateSaleStock,
  type RegisterSaleInput,
  type SaleResponse,
} from "./sales"

const cable: Product = {
  id: "3f2a9c1e-0000-4000-8000-000000000001",
  barcode: "7891000000011",
  name: "Cabo USB-C reforçado",
  priceInCents: 2990,
  stock: 18,
  minStock: 5,
}

const screenProtector: Product = {
  id: "3f2a9c1e-0000-4000-8000-000000000002",
  barcode: "7891000000028",
  name: "Película de vidro 6,1”",
  priceInCents: 3990,
  stock: 4,
  minStock: 6,
}

const input: RegisterSaleInput = {
  items: [
    {
      productId: cable.id,
      name: cable.name,
      quantity: 2,
      unitPriceInCents: 2990,
    },
  ],
  totals: { subtotalInCents: 5980, discountInCents: 500, totalInCents: 5480 },
  paymentMethod: "PIX",
  customer: { cpf: "52998224725" },
}

const createdSale: SaleResponse = {
  id: "9b0c0000-0000-4000-8000-000000000042",
  number: "V-0042",
  status: "COMPLETED",
  paymentMethod: "PIX",
  subtotalInCents: 5980,
  discountInCents: 500,
  totalInCents: 5480,
  customerCpf: "52998224725",
  sellerName: "Maria",
  createdAt: "2026-10-22T13:00:00Z",
  items: [
    {
      productId: cable.id,
      productName: cable.name,
      quantity: 2,
      unitPriceInCents: 2990,
      totalInCents: 5980,
    },
  ],
}

/** Responde a venda e, depois, a recarga dos produtos. */
function mockFetch(saleStatus: number, saleBody: unknown) {
  const fetchMock = vi.fn((path: string, _init?: RequestInit) =>
    Promise.resolve(
      new Response(JSON.stringify(path === "/api/sales" ? saleBody : []), {
        status: path === "/api/sales" ? saleStatus : 200,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  )
  vi.stubGlobal("fetch", fetchMock)
  // Os testes rodam no Node (sem navegador): o apiFetch lê o token CSRF do document.cookie.
  vi.stubGlobal("document", { cookie: "XSRF-TOKEN=token-de-teste" })
  return fetchMock
}

describe("registerSale", () => {
  beforeEach(() => {
    resetProductsForTests([cable, screenProtector])
    resetSalesForTests()
  })
  afterEach(() => vi.unstubAllGlobals())

  it("sends only ids and quantities; prices and totals are the backend's job", async () => {
    const fetchMock = mockFetch(201, createdSale)

    await registerSale(input)

    const [path, options] = fetchMock.mock.calls[0] as unknown as [
      string,
      RequestInit,
    ]
    expect(path).toBe("/api/sales")
    expect(options.method).toBe("POST")
    expect(JSON.parse(options.body as string)).toEqual({
      items: [{ productId: cable.id, quantity: 2 }],
      discountInCents: 500,
      paymentMethod: "PIX",
      customerCpf: "52998224725",
    })
  })

  it("uses the number, date and totals returned by the backend", async () => {
    mockFetch(201, createdSale)

    const sale = await registerSale(input)

    expect(sale).toMatchObject({
      number: "V-0042",
      date: new Date("2026-10-22T13:00:00Z"),
      totals: {
        subtotalInCents: 5980,
        discountInCents: 500,
        totalInCents: 5480,
      },
      customer: { cpf: "52998224725" },
    })
    expect(sales).toHaveLength(1)
  })

  it("sends null when there is no customer", async () => {
    const fetchMock = mockFetch(201, { ...createdSale, customerCpf: null })

    const sale = await registerSale({ ...input, customer: null })

    const options = fetchMock.mock.calls[0][1] as RequestInit
    expect(JSON.parse(options.body as string).customerCpf).toBeNull()
    expect(sale.customer).toBeNull()
  })

  it("notifies subscribers and reloads the products to show the new stock", async () => {
    const fetchMock = mockFetch(201, createdSale)
    const listener = vi.fn()
    const unsubscribe = subscribeSales(listener)

    await registerSale(input)

    expect(listener).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith("/api/products", expect.anything())
    unsubscribe()
  })

  it("passes on the backend message and records nothing", async () => {
    mockFetch(400, {
      message: "Estoque insuficiente para Cabo USB-C reforçado. Disponível: 1.",
    })

    await expect(registerSale(input)).rejects.toThrow(
      "Estoque insuficiente para Cabo USB-C reforçado. Disponível: 1.",
    )
    expect(sales).toHaveLength(0)
  })
})

describe("validateSaleStock", () => {
  it("validates all item stock before starting a Pix payment", () => {
    const validation = validateSaleStock(
      [
        {
          productId: cable.id,
          name: cable.name,
          quantity: 1,
          unitPriceInCents: cable.priceInCents,
        },
        {
          productId: screenProtector.id,
          name: screenProtector.name,
          quantity: screenProtector.stock + 1,
          unitPriceInCents: screenProtector.priceInCents,
        },
      ],
      [cable, screenProtector],
    )

    expect(validation).toEqual({
      valid: false,
      message: `Estoque insuficiente para ${screenProtector.name}. Disponível: ${screenProtector.stock}.`,
    })
  })
})
