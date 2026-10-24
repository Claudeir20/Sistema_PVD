// @refresh reset
import { useMemo, useState } from "react"
import MetricCard from "../../components/ui/MetricCard"
import PageHeader from "../../components/ui/PageHeader"
import { formatMoney } from "../../domain/formatters"
import { useAuth } from "../auth/AuthContext"
import useProducts from "../products/useProducts"
import {
  calculateDashboardMetrics,
  getGreeting,
  groupSalesByDay,
  type DashboardPeriod,
} from "./dashboard"
import LowStockList from "./components/LowStockList"
import PeriodFilter from "./components/PeriodFilter"
import SalesByDayChart from "./components/SalesByDayChart"
import useSalesByPeriod from "./hooks/useSalesByPeriod"

export default function DashboardPage() {
  const {
    products,
    status: productsStatus,
    error: productsError,
    reload,
  } = useProducts()
  const { user } = useAuth()
  // Só o primeiro nome: "Bom dia, Maria", não "Bom dia, Maria da Silva".
  const firstName = user?.name.split(" ")[0] ?? ""
  const [period, setPeriod] = useState<DashboardPeriod>("TODAY")
  const now = useMemo(() => new Date(), [])
  const {
    sales,
    canceledCount,
    loading: salesLoading,
    error: salesError,
    retry: retrySales,
  } = useSalesByPeriod(period, now)
  const metrics = calculateDashboardMetrics(sales, period, now)
  const dailySales = groupSalesByDay(sales, period, now)

  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          actions={<PeriodFilter onChange={setPeriod} value={period} />}
          description="Acompanhe as vendas e o estoque da loja."
          title={`${getGreeting(now.getHours())}, ${firstName}`}
        />

        {salesError ? (
          <p
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            Não foi possível carregar as vendas: {salesError}{" "}
            <button
              className="font-semibold underline"
              onClick={retrySales}
              type="button"
            >
              Tentar de novo
            </button>
          </p>
        ) : null}

        <section
          aria-busy={salesLoading}
          className={`mt-6 grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-4 ${
            salesLoading ? "opacity-60" : ""
          }`}
        >
          <MetricCard
            label="Faturamento"
            value={formatMoney(metrics.revenueInCents)}
          />
          <MetricCard
            helper={
              canceledCount > 0
                ? `${canceledCount} cancelada${canceledCount > 1 ? "s" : ""} (fora do total)`
                : undefined
            }
            label="Vendas"
            value={metrics.salesCount}
          />
          <MetricCard
            label="Ticket médio"
            value={formatMoney(metrics.averageTicketInCents)}
          />
          <MetricCard
            helper="produtos para repor"
            label="Abaixo do mínimo"
            // Mesma regra do backend (Product.isBelowMinStock): no mínimo já pede reposição.
            value={
              products.filter((product) => product.stock <= product.minStock)
                .length
            }
          />
        </section>

        <section className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(300px,0.9fr)]">
          <SalesByDayChart data={dailySales} />
          <LowStockList
            error={productsError}
            onRetry={reload}
            products={products}
            status={productsStatus}
          />
        </section>
      </div>
    </main>
  )
}
