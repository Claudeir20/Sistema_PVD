import type { ServiceOrderStatus } from "../../domain/serviceOrderStatus"
import type { DashboardServiceOrder } from "../../services/serviceOrders"

/** O que o painel precisa de uma venda (serve para SaleSummary e RegisteredSale). */
export interface DashboardSale {
  date: Date
  totals: { totalInCents: number }
}

export type DashboardPeriod = "TODAY" | "SEVEN_DAYS" | "MONTH"

export interface DashboardMetrics {
  revenueInCents: number
  salesCount: number
  averageTicketInCents: number
  openServiceOrders: number
}

function startOfDay(date: Date) {
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

export function getPeriodStart(period: DashboardPeriod, now = new Date()) {
  const start = startOfDay(now)

  if (period === "SEVEN_DAYS") {
    start.setDate(start.getDate() - 6)
  }

  if (period === "MONTH") {
    start.setDate(1)
  }

  return start
}

export function filterSalesByPeriod(
  sales: readonly DashboardSale[],
  period: DashboardPeriod,
  now = new Date(),
) {
  const start = getPeriodStart(period, now)
  const end = new Date(now)
  end.setHours(23, 59, 59, 999)

  return sales.filter((sale) => sale.date >= start && sale.date <= end)
}

export function calculateDashboardMetrics(
  sales: readonly DashboardSale[],
  serviceOrders: readonly DashboardServiceOrder[],
  period: DashboardPeriod,
  now = new Date(),
): DashboardMetrics {
  const periodSales = filterSalesByPeriod(sales, period, now)
  const revenueInCents = periodSales.reduce(
    (total, sale) => total + sale.totals.totalInCents,
    0,
  )

  return {
    revenueInCents,
    salesCount: periodSales.length,
    averageTicketInCents:
      periodSales.length > 0
        ? Math.round(revenueInCents / periodSales.length)
        : 0,
    openServiceOrders: serviceOrders.filter(
      (order) => order.status !== "DELIVERED",
    ).length,
  }
}

export function groupSalesByDay(
  sales: readonly DashboardSale[],
  period: DashboardPeriod,
  now = new Date(),
) {
  const grouped = new Map<string, number>()

  for (const sale of filterSalesByPeriod(sales, period, now)) {
    const key = getLocalDateKey(sale.date)
    grouped.set(key, (grouped.get(key) ?? 0) + sale.totals.totalInCents)
  }

  const result: Array<{ date: string; totalInCents: number }> = []
  const cursor = getPeriodStart(period, now)
  const end = startOfDay(now)

  while (cursor <= end) {
    const date = getLocalDateKey(cursor)
    result.push({ date, totalInCents: grouped.get(date) ?? 0 })
    cursor.setDate(cursor.getDate() + 1)
  }

  return result
}

/** Data local no formato AAAA-MM-DD (o mesmo que a API de vendas recebe). */
export function getLocalDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export function countServiceOrdersByStatus(
  serviceOrders: readonly DashboardServiceOrder[],
) {
  return serviceOrders.reduce<Partial<Record<ServiceOrderStatus, number>>>(
    (totals, order) => {
      totals[order.status] = (totals[order.status] ?? 0) + 1
      return totals
    },
    {},
  )
}

export function getGreeting(hour: number) {
  if (hour < 12) return "Bom dia"
  if (hour < 18) return "Boa tarde"
  return "Boa noite"
}
