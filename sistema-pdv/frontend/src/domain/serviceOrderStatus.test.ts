import { describe, expect, it } from "vitest"
import {
  canAdvance,
  nextStatus,
  serviceOrderStatuses,
} from "./serviceOrderStatus"

describe("serviceOrderStatuses", () => {
  it("keeps the service order workflow in its canonical order", () => {
    expect(serviceOrderStatuses).toEqual([
      "OPEN",
      "DIAGNOSIS",
      "AWAITING_APPROVAL",
      "IN_REPAIR",
      "READY",
      "DELIVERED",
    ])
  })
})

describe("nextStatus", () => {
  it("returns the immediately following status", () => {
    expect(nextStatus("OPEN")).toBe("DIAGNOSIS")
    expect(nextStatus("AWAITING_APPROVAL")).toBe("IN_REPAIR")
    expect(nextStatus("READY")).toBe("DELIVERED")
  })

  it("returns null for the terminal status", () => {
    expect(nextStatus("DELIVERED")).toBeNull()
  })
})

describe("canAdvance", () => {
  it("allows advancing only to the next status", () => {
    expect(canAdvance("DIAGNOSIS")).toBe(true)
    expect(canAdvance("DIAGNOSIS", "AWAITING_APPROVAL")).toBe(true)
    expect(canAdvance("DIAGNOSIS", "IN_REPAIR")).toBe(false)
    expect(canAdvance("DIAGNOSIS", "OPEN")).toBe(false)
  })

  it("does not allow advancing from the terminal status", () => {
    expect(canAdvance("DELIVERED")).toBe(false)
  })
})
