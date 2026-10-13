import { describe, expect, it } from "vitest"
import type { DashboardServiceOrder } from "../../services/serviceOrders"
import type { RegisteredSale } from "../../services/sales"
import {
  calculateDashboardMetrics,
  filterSalesByPeriod,
  getGreeting,
  groupSalesByDay,
} from "./dashboard"

const now = new Date("2026-03-20T14:00:00")

function sale(
  number: string,
  date: string,
  totalInCents: number,
): RegisteredSale {
  return {
    number,
    date: new Date(date),
    items: [],
    totals: {
      subtotalInCents: totalInCents,
      discountInCents: 0,
      totalInCents,
    },
    paymentMethod: "PIX",
    customer: null,
  }
}

const sales = [
  sale("V-1", "2026-03-20T10:00:00", 1000),
  sale("V-2", "2026-03-20T12:00:00", 3000),
  sale("V-3", "2026-03-16T12:00:00", 5000),
  sale("V-4", "2026-02-28T12:00:00", 9000),
]

const orders: DashboardServiceOrder[] = [
  { id: "1", device: "A", status: "DIAGNOSIS" },
  { id: "2", device: "B", status: "DELIVERED" },
]

describe("dashboard calculations", () => {
  it("calculates today's metrics and average ticket in cents", () => {
    expect(calculateDashboardMetrics(sales, orders, "TODAY", now)).toEqual({
      revenueInCents: 4000,
      salesCount: 2,
      averageTicketInCents: 2000,
      openServiceOrders: 1,
    })
  })

  it("filters the last seven days and the current month", () => {
    expect(filterSalesByPeriod(sales, "SEVEN_DAYS", now)).toHaveLength(3)
    expect(filterSalesByPeriod(sales, "MONTH", now)).toHaveLength(3)
  })

  it("groups daily revenue", () => {
    expect(groupSalesByDay(sales, "SEVEN_DAYS", now)).toEqual([
      { date: "2026-03-14", totalInCents: 0 },
      { date: "2026-03-15", totalInCents: 0 },
      { date: "2026-03-16", totalInCents: 5000 },
      { date: "2026-03-17", totalInCents: 0 },
      { date: "2026-03-18", totalInCents: 0 },
      { date: "2026-03-19", totalInCents: 0 },
      { date: "2026-03-20", totalInCents: 4000 },
    ])
  })

  it("includes every day from the beginning of the month", () => {
    const result = groupSalesByDay(sales, "MONTH", now)

    expect(result).toHaveLength(20)
    expect(result[0]).toEqual({
      date: "2026-03-01",
      totalInCents: 0,
    })
    expect(result[19]).toEqual({
      date: "2026-03-20",
      totalInCents: 4000,
    })
  })

  it("returns the greeting for each time of day", () => {
    expect(getGreeting(8)).toBe("Bom dia")
    expect(getGreeting(15)).toBe("Boa tarde")
    expect(getGreeting(21)).toBe("Boa noite")
  })
})
