import { useCallback, useEffect, useMemo, useState } from "react"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import MetricCard from "../../components/ui/MetricCard"
import PageHeader from "../../components/ui/PageHeader"
import { formatMoney } from "../../domain/formatters"
import { paymentMethodLabels } from "../../domain/paymentMethods"
import type { PaymentMethod } from "../../domain/types"
import { fetchSalesByPeriod, type SaleSummary } from "../../services/sales"
import {
  getLocalDateKey,
  getPeriodStart,
  type DashboardPeriod,
} from "../dashboard/dashboard"
import SaleDetailDialog from "./components/SaleDetailDialog"

const quickPeriods: { value: DashboardPeriod; label: string }[] = [
  { value: "TODAY", label: "Hoje" },
  { value: "SEVEN_DAYS", label: "7 dias" },
  { value: "MONTH", label: "Mês" },
]

const paymentOrder: PaymentMethod[] = ["CASH", "PIX", "DEBIT", "CREDIT"]

const timeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
})

/** Vendas de um período (só ADMIN): conferência do caixa, detalhe e cancelamento. */
export default function SalesPage() {
  const today = getLocalDateKey(new Date())
  const [from, setFrom] = useState(today)
  const [to, setTo] = useState(today)
  const [sales, setSales] = useState<SaleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [openSaleId, setOpenSaleId] = useState<string | null>(null)
  const [showCanceled, setShowCanceled] = useState(true)

  const reload = useCallback(async () => {
    if (!from || !to) return
    setLoading(true)
    setError("")
    try {
      setSales(await fetchSalesByPeriod(from, to))
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível carregar.",
      )
    } finally {
      setLoading(false)
    }
  }, [from, to])

  useEffect(() => {
    void reload()
  }, [reload])

  function selectQuickPeriod(period: DashboardPeriod) {
    const now = new Date()
    setFrom(getLocalDateKey(getPeriodStart(period, now)))
    setTo(getLocalDateKey(now))
  }

  const completed = useMemo(
    () => sales.filter((sale) => !sale.canceled),
    [sales],
  )

  // O que entrou em cada forma de pagamento: é o que se confere no fechamento do caixa.
  const byPayment = useMemo(() => {
    const totals = new Map<
      PaymentMethod,
      { count: number; totalInCents: number }
    >()
    for (const sale of completed) {
      const current = totals.get(sale.paymentMethod) ?? {
        count: 0,
        totalInCents: 0,
      }
      totals.set(sale.paymentMethod, {
        count: current.count + 1,
        totalInCents: current.totalInCents + sale.totals.totalInCents,
      })
    }
    return totals
  }, [completed])

  const revenueInCents = completed.reduce(
    (total, sale) => total + sale.totals.totalInCents,
    0,
  )
  const canceledCount = sales.length - completed.length
  const visibleSales = showCanceled ? sales : completed

  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          description="Confira as vendas do período, veja os itens de cada uma e cancele quando precisar."
          title="Vendas"
        />

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-end">
          <div
            aria-label="Período rápido"
            className="inline-flex rounded-lg border border-neutral-300 bg-white p-1"
            role="group"
          >
            {quickPeriods.map((period) => (
              <button
                className="rounded-md px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-100"
                key={period.value}
                onClick={() => selectQuickPeriod(period.value)}
                type="button"
              >
                {period.label}
              </button>
            ))}
          </div>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">
              De
            </span>
            <input
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              max={to}
              onChange={(event) => setFrom(event.target.value)}
              type="date"
              value={from}
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-neutral-600">
              Até
            </span>
            <input
              className="h-10 rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
              min={from}
              onChange={(event) => setTo(event.target.value)}
              type="date"
              value={to}
            />
          </label>
          <label className="flex items-center gap-2 text-sm text-neutral-700 lg:ml-auto">
            <input
              checked={showCanceled}
              onChange={(event) => setShowCanceled(event.target.checked)}
              type="checkbox"
            />
            Mostrar canceladas
          </label>
        </div>

        <section
          aria-busy={loading}
          className={`mt-5 grid gap-4 transition-opacity sm:grid-cols-2 xl:grid-cols-4 ${
            loading ? "opacity-60" : ""
          }`}
        >
          <MetricCard
            helper={`${completed.length} venda${completed.length === 1 ? "" : "s"}`}
            label="Faturamento"
            value={formatMoney(revenueInCents)}
          />
          <MetricCard
            label="Ticket médio"
            value={formatMoney(
              completed.length > 0
                ? Math.round(revenueInCents / completed.length)
                : 0,
            )}
          />
          <MetricCard
            helper="fora do faturamento"
            label="Canceladas"
            value={canceledCount}
          />
          <Card className="p-4">
            <p className="text-sm font-medium text-neutral-500">
              Por forma de pagamento
            </p>
            <dl className="mt-2 space-y-1 text-sm">
              {paymentOrder.map((method) => (
                <div className="flex justify-between" key={method}>
                  <dt className="text-neutral-600">
                    {paymentMethodLabels[method]}
                    <span className="ml-1 text-xs text-neutral-400">
                      ({byPayment.get(method)?.count ?? 0})
                    </span>
                  </dt>
                  <dd className="font-mono font-medium text-neutral-900">
                    {formatMoney(byPayment.get(method)?.totalInCents ?? 0)}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </section>

        {error ? (
          <p
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            Não foi possível carregar as vendas: {error}{" "}
            <button
              className="font-semibold underline"
              onClick={() => void reload()}
              type="button"
            >
              Tentar de novo
            </button>
          </p>
        ) : null}

        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Número</th>
                <th className="px-4 py-3 font-medium">Data e hora</th>
                <th className="px-4 py-3 font-medium">Pagamento</th>
                <th className="px-4 py-3 text-right font-medium">Total</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {visibleSales.map((sale) => (
                <tr
                  className={sale.canceled ? "text-neutral-400" : ""}
                  key={sale.id}
                >
                  <td className="px-4 py-3 font-mono font-semibold">
                    <span
                      className={
                        sale.canceled ? "line-through" : "text-neutral-900"
                      }
                    >
                      {sale.number}
                    </span>
                  </td>
                  <td className="px-4 py-3">{timeFormat.format(sale.date)}</td>
                  <td className="px-4 py-3">
                    {paymentMethodLabels[sale.paymentMethod]}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMoney(sale.totals.totalInCents)}
                  </td>
                  <td className="px-4 py-3">
                    {sale.canceled ? (
                      <Badge variant="danger">Cancelada</Badge>
                    ) : (
                      <Badge variant="success">Concluída</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      className="min-h-9 px-3 text-xs"
                      onClick={() => setOpenSaleId(sale.id)}
                    >
                      Detalhes
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && !error && visibleSales.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">
              Nenhuma venda neste período.
            </p>
          ) : null}
          {loading && sales.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">
              Carregando vendas...
            </p>
          ) : null}
        </Card>
      </div>

      {openSaleId ? (
        <SaleDetailDialog
          key={openSaleId}
          onCanceled={() => void reload()}
          onClose={() => setOpenSaleId(null)}
          saleId={openSaleId}
        />
      ) : null}
    </main>
  )
}
