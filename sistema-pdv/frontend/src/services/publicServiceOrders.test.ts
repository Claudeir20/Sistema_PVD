import { beforeEach, describe, expect, it } from "vitest"
import {
  getPublicServiceOrderByToken,
  resetPublicServiceOrdersForTests,
  submitCustomerDecision,
} from "./publicServiceOrders"

const token = "os-0001-demo"

describe("submitCustomerDecision", () => {
  beforeEach(() => {
    resetPublicServiceOrdersForTests()
  })

  it("advances an approved order to IN_REPAIR and returns the updated order", async () => {
    const updatedOrder = await submitCustomerDecision(token, "APPROVED")

    expect(updatedOrder.status).toBe("IN_REPAIR")
    expect(updatedOrder.budgetDecision).toBe("APPROVED")
    await expect(getPublicServiceOrderByToken(token)).resolves.toMatchObject({
      status: "IN_REPAIR",
      budgetDecision: "APPROVED",
    })
  })

  it("marks a rejected budget without advancing the order status", async () => {
    const updatedOrder = await submitCustomerDecision(token, "DECLINED")

    expect(updatedOrder.status).toBe("AWAITING_APPROVAL")
    expect(updatedOrder.budgetDecision).toBe("DECLINED")
    await expect(getPublicServiceOrderByToken(token)).resolves.toMatchObject({
      status: "AWAITING_APPROVAL",
      budgetDecision: "DECLINED",
    })
  })
})
