import { describe, expect, it } from "vitest"
import { formatDate, formatMoney, formatPhone } from "./formatters"

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

describe("formatPhone", () => {
  it("formats mobile and landline numbers", () => {
    expect(formatPhone("11999998888")).toBe("(11) 99999-8888")
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444")
  })

  it("removes the Brazilian country code before formatting", () => {
    expect(formatPhone("+55 11 99999-8888")).toBe("(11) 99999-8888")
  })

  it("keeps unsupported values unchanged", () => {
    expect(formatPhone("1234")).toBe("1234")
  })
})
