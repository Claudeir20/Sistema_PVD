import { describe, expect, it } from "vitest"
import { calculateBudgetTotal } from "./budget"

describe("calculateBudgetTotal", () => {
  it("returns zero for an empty budget", () => {
    expect(calculateBudgetTotal([])).toBe(0)
  })

  it("adds parts and services using integer cents", () => {
    expect(
      calculateBudgetTotal([
        { priceInCents: 1999 },
        { priceInCents: 8500 },
        { priceInCents: 1 },
      ]),
    ).toBe(10500)
  })

  it("accounts for item quantities", () => {
    expect(
      calculateBudgetTotal([
        { priceInCents: 1250, quantity: 2 },
        { priceInCents: 5000, quantity: 1 },
      ]),
    ).toBe(7500)
  })
})
