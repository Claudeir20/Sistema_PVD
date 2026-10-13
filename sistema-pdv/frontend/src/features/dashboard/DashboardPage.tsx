// @refresh reset
import { useMemo, useState } from "react"
import MetricCard from "../../components/ui/MetricCard"
import PageHeader from "../../components/ui/PageHeader"
import { formatMoney } from "../../domain/formatters"
import { accountsPayable } from "../../services/accountsPayable"
import { products } from "../../services/products"
import { exampleSales, sales } from "../../services/sales"
import { serviceOrders } from "../../services/serviceOrders"
import {
  calculateDashboardMetrics,
  getGreeting,
  groupSalesByDay,
  type DashboardPeriod,
} from "./dashboard"
import LowStockList from "./components/LowStockList"
import PeriodFilter from "./components/PeriodFilter"
import SalesByDayChart from "./components/SalesByDayChart"
import ServiceOrdersByStatus from "./components/ServiceOrdersByStatus"
import UpcomingPayables from "./components/UpcomingPayables"
import useDashboardUpdates from "./hooks/useDashboardUpdates"

export default function DashboardPage() {
  useDashboardUpdates()
  const [period, setPeriod] = useState<DashboardPeriod>("TODAY")
  const now = useMemo(() => new Date(), [])
  const allSales = [...exampleSales, ...sales]
  const metrics = calculateDashboardMetrics(
    allSales,
    serviceOrders,
    period,
    now,
  )
  const dailySales = groupSalesByDay(allSales, period, now)

  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          actions={<PeriodFilter onChange={setPeriod} value={period} />}
          description="Acompanhe as vendas, ordens de serviço e compromissos da loja."
          title={`${getGreeting(now.getHours())}, Marina`}
        />

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Faturamento"
            value={formatMoney(metrics.revenueInCents)}
          />
          <MetricCard label="Vendas" value={metrics.salesCount} />
          <MetricCard
            label="Ticket médio"
            value={formatMoney(metrics.averageTicketInCents)}
          />
          <MetricCard label="OS em aberto" value={metrics.openServiceOrders} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)]">
          <SalesByDayChart data={dailySales} />
          <ServiceOrdersByStatus orders={serviceOrders} />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-2">
          <LowStockList products={products} />
          <UpcomingPayables accounts={accountsPayable} now={now} />
        </section>
      </div>
    </main>
  )
}
