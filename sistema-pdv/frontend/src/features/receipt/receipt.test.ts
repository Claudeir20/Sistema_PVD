import { describe, expect, it } from "vitest"
import type { SaleResponse } from "../../services/sales"
import { buildReceipt } from "./receipt"

const store = { name: "Minha Loja", cnpj: "", address: "" }

const sale: SaleResponse = {
  id: "9b0c0000-0000-4000-8000-000000000042",
  number: "V-0042",
  status: "COMPLETED",
  paymentMethod: "CASH",
  subtotalInCents: 5980,
  discountInCents: 500,
  totalInCents: 5480,
  cashReceivedInCents: 6000,
  changeInCents: 520,
  customerCpf: "52998224725",
  sellerName: "Maria",
  createdAt: "2026-10-22T13:05:00Z",
  canceledAt: null,
  canceledByName: null,
  cancellationReason: null,
  items: [
    {
      productId: "p1",
      productName: "Cabo USB-C",
      quantity: 2,
      unitPriceInCents: 2990,
      totalInCents: 5980,
    },
  ],
}

// Intl usa espaço sem quebra entre "R$" e o valor.
const plain = (text: string) => text.replace(/ /g, " ")

describe("buildReceipt", () => {
  it("shows items, totals with discount and cash change, in the store time zone", () => {
    const receipt = buildReceipt(sale, store)

    expect(receipt.title).toBe("COMPROVANTE DE VENDA")
    expect(receipt.date).toBe("22/10/2026, 10:05")
    expect(receipt.items.map((i) => plain(`${i.detail} = ${i.total}`))).toEqual(
      ["2 x R$ 29,90 = R$ 59,80"],
    )
    expect(receipt.totals.map((l) => plain(`${l.label} ${l.value}`))).toEqual([
      "Subtotal R$ 59,80",
      "Desconto - R$ 5,00",
      "TOTAL R$ 54,80",
    ])
    expect(receipt.payment.map((l) => plain(`${l.label} ${l.value}`))).toEqual([
      "Pagamento Dinheiro",
      "Recebido R$ 60,00",
      "Troco R$ 5,20",
      "CPF 529.982.247-25",
      "Vendedor Maria",
    ])
    expect(receipt.footer).toEqual([
      "Não é documento fiscal",
      "Obrigado pela preferência!",
    ])
  })

  it("skips subtotal, change and CPF when they do not apply", () => {
    const receipt = buildReceipt(
      {
        ...sale,
        paymentMethod: "PIX",
        discountInCents: 0,
        totalInCents: 5980,
        cashReceivedInCents: null,
        changeInCents: null,
        customerCpf: null,
      },
      store,
    )

    expect(receipt.totals.map((l) => l.label)).toEqual(["TOTAL"])
    expect(receipt.payment.map((l) => l.label)).toEqual([
      "Pagamento",
      "Vendedor",
    ])
  })

  it("marks a canceled sale", () => {
    const receipt = buildReceipt(
      { ...sale, status: "CANCELED", canceledAt: "2026-10-22T14:00:00Z" },
      store,
    )

    expect(receipt.canceled).toBe(true)
    expect(receipt.title).toBe("VENDA CANCELADA")
    expect(receipt.footer).toEqual([
      "Venda cancelada em 22/10/2026, 11:00",
      "Não é documento fiscal",
    ])
  })
})
