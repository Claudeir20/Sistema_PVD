import { describe, expect, it } from "vitest"
import { isSaleLocked, saleStatuses, transitionSaleStatus } from "./saleStatus"

describe("sale status", () => {
  it("keeps the canonical status order", () => {
    expect(saleStatuses).toEqual(["EDITING", "AWAITING_PAYMENT", "COMPLETED"])
  })

  it("starts and cancels a Pix payment", () => {
    const awaitingPayment = transitionSaleStatus("EDITING", "START_PIX_PAYMENT")

    expect(awaitingPayment).toBe("AWAITING_PAYMENT")
    expect(isSaleLocked(awaitingPayment)).toBe(true)
    expect(transitionSaleStatus(awaitingPayment, "CANCEL_PAYMENT")).toBe(
      "EDITING",
    )
  })

  it("completes a confirmed Pix payment", () => {
    expect(transitionSaleStatus("AWAITING_PAYMENT", "PAYMENT_CONFIRMED")).toBe(
      "COMPLETED",
    )
  })

  it("keeps the payment state when registration fails after confirmation", () => {
    expect(
      transitionSaleStatus("AWAITING_PAYMENT", "REGISTRATION_FAILED"),
    ).toBe("AWAITING_PAYMENT")
  })

  it("completes a non-Pix sale directly", () => {
    expect(transitionSaleStatus("EDITING", "COMPLETE_SALE")).toBe("COMPLETED")
  })

  it("starts a new editable sale after completion", () => {
    expect(transitionSaleStatus("COMPLETED", "START_NEW_SALE")).toBe("EDITING")
  })

  it("ignores invalid events", () => {
    expect(transitionSaleStatus("EDITING", "PAYMENT_CONFIRMED")).toBe("EDITING")
  })
})
