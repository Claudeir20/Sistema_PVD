import { useEffect, useState, useSyncExternalStore } from "react"
import {
  fetchSalesByPeriod,
  getSalesVersion,
  subscribeSales,
  type SaleSummary,
} from "../../../services/sales"
import {
  getLocalDateKey,
  getPeriodStart,
  type DashboardPeriod,
} from "../dashboard"

/**
 * Vendas do período vindas do backend. Busca de novo quando o período muda
 * ou quando uma venda é registrada nesta aba.
 */
export default function useSalesByPeriod(period: DashboardPeriod, now: Date) {
  const salesVersion = useSyncExternalStore(
    subscribeSales,
    getSalesVersion,
    getSalesVersion,
  )
  const [sales, setSales] = useState<SaleSummary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [attempt, setAttempt] = useState(0)

  const from = getLocalDateKey(getPeriodStart(period, now))
  const to = getLocalDateKey(now)

  useEffect(() => {
    let ignore = false // resposta de um período antigo não sobrescreve o atual
    setLoading(true)
    setError("")

    fetchSalesByPeriod(from, to)
      .then((result) => {
        if (!ignore) setSales(result)
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(
            err instanceof Error
              ? err.message
              : "Não foi possível carregar as vendas.",
          )
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [from, to, salesVersion, attempt])

  return {
    /** Só as vendas válidas: as canceladas não entram em faturamento e gráfico. */
    sales: sales.filter((sale) => !sale.canceled),
    canceledCount: sales.filter((sale) => sale.canceled).length,
    loading,
    error,
    retry: () => setAttempt((current) => current + 1),
  }
}
