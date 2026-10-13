import Card from "../../../components/ui/Card"
import { formatMoney } from "../../../domain/formatters"

interface SalesByDayChartProps {
  data: Array<{ date: string; totalInCents: number }>
}

const heightClasses = [
  "h-3",
  "h-8",
  "h-12",
  "h-16",
  "h-20",
  "h-24",
  "h-28",
  "h-32",
  "h-36",
]

function barHeight(value: number, maximum: number) {
  if (value === 0) return "h-0"
  if (maximum <= 0) return heightClasses[0]
  const index = Math.max(
    0,
    Math.ceil((value / maximum) * (heightClasses.length - 1)),
  )
  return heightClasses[index]
}

export default function SalesByDayChart({ data }: SalesByDayChartProps) {
  const maximum = Math.max(...data.map((item) => item.totalInCents), 0)

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="font-bold text-neutral-900">Vendas por dia</h2>
        <span className="text-xs text-neutral-500">Faturamento do período</span>
      </div>

      {data.length === 0 ? (
        <div className="mt-5 grid h-48 place-items-center rounded-lg border border-dashed border-neutral-300 text-sm text-neutral-500">
          Nenhuma venda no período
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto">
          <div className="flex h-52 min-w-[420px] items-end gap-3 border-b border-neutral-200 px-2">
            {data.map((item) => (
              <div
                className="flex min-w-12 flex-1 flex-col items-center justify-end gap-2"
                key={item.date}
              >
                <span className="text-[10px] font-medium text-neutral-500">
                  {formatMoney(item.totalInCents)}
                </span>
                <div
                  className={`w-full max-w-14 rounded-t-md bg-blue-600 transition-all ${barHeight(
                    item.totalInCents,
                    maximum,
                  )}`}
                />
                <span className="pb-2 text-xs text-neutral-500">
                  {new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "2-digit",
                  }).format(new Date(`${item.date}T12:00:00`))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}
