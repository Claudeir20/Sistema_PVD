import { describe, expect, it } from "vitest"
import { checkCashReceived, quickCashOptions } from "./cashPayment"

describe("checkCashReceived", () => {
  it("calculates the change", () => {
    expect(checkCashReceived(8470, 10000)).toEqual({
      status: "OK",
      changeInCents: 1530,
      highChange: false,
    })
  })

  it("accepts the exact amount with no change", () => {
    expect(checkCashReceived(8470, 8470)).toEqual({
      status: "OK",
      changeInCents: 0,
      highChange: false,
    })
  })

  it("says how much is missing", () => {
    expect(checkCashReceived(8470, 5000)).toEqual({
      status: "MISSING",
      missingInCents: 3470,
    })
  })

  it("treats an empty field as not informed", () => {
    expect(checkCashReceived(8470, null)).toEqual({ status: "EMPTY" })
  })

  it("flags a high change (probably a typo)", () => {
    expect(checkCashReceived(8470, 1000000)).toMatchObject({
      status: "OK",
      highChange: true,
    })
  })
})

describe("quickCashOptions", () => {
  it("offers the exact amount and the next bills above the total", () => {
    expect(quickCashOptions(8570)).toEqual([8570, 10000, 20000])
    expect(quickCashOptions(1290)).toEqual([1290, 2000, 5000, 10000])
  })

  it("offers only the exact amount when it is above every bill", () => {
    expect(quickCashOptions(25000)).toEqual([25000])
  })

  it("offers nothing for an empty cart", () => {
    expect(quickCashOptions(0)).toEqual([])
  })
})
