import { describe, expect, it } from "vitest"
import {
  centsToInput,
  formatDate,
  formatMoney,
  parseMoneyToCents,
} from "./formatters"

describe("formatMoney", () => {
  it("formats integer cents as Brazilian reais", () => {
    expect(formatMoney(0)).toBe("R$ 0,00")
    expect(formatMoney(123456)).toBe("R$ 1.234,56")
  })

  it("preserves negative cent values", () => {
    expect(formatMoney(-250)).toBe("-R$ 2,50")
  })
})

describe("formatDate", () => {
  it("formats an ISO date without changing its calendar day", () => {
    expect(formatDate("2025-02-03")).toBe("03/02/2025")
  })
})

describe("parseMoneyToCents", () => {
  it("reads comma and dot decimals the same way", () => {
    expect(parseMoneyToCents("29,90")).toBe(2990)
    expect(parseMoneyToCents("29.90")).toBe(2990)
    expect(parseMoneyToCents("4.8")).toBe(480)
  })

  it("treats dots as thousands when there is a comma or no decimal part", () => {
    expect(parseMoneyToCents("1.234,56")).toBe(123456)
    expect(parseMoneyToCents("1.234")).toBe(123400)
    expect(parseMoneyToCents("R$ 89,90")).toBe(8990)
    expect(parseMoneyToCents("29")).toBe(2900)
  })

  it("rejects text that is not a value", () => {
    expect(parseMoneyToCents("")).toBeNull()
    expect(parseMoneyToCents("abc")).toBeNull()
    expect(parseMoneyToCents("-5")).toBeNull()
    expect(parseMoneyToCents("1,234,5")).toBeNull()
  })

  it("round-trips with centsToInput (reopening the discount dialog)", () => {
    expect(centsToInput(480)).toBe("4,80")
    expect(parseMoneyToCents(centsToInput(480))).toBe(480)
  })
})
