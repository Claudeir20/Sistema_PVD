import Button from "../../../components/ui/Button"
import type { DashboardPeriod } from "../dashboard"

const periods: Array<{ label: string; value: DashboardPeriod }> = [
  { label: "Hoje", value: "TODAY" },
  { label: "7 dias", value: "SEVEN_DAYS" },
  { label: "Mês", value: "MONTH" },
]

interface PeriodFilterProps {
  value: DashboardPeriod
  onChange: (period: DashboardPeriod) => void
}

export default function PeriodFilter({ value, onChange }: PeriodFilterProps) {
  return (
    <div
      aria-label="Período do painel"
      className="flex rounded-lg border border-neutral-300 bg-white p-1"
      role="group"
    >
      {periods.map((period) => (
        <Button
          className="min-h-9 border-0 px-4"
          key={period.value}
          onClick={() => onChange(period.value)}
          variant={value === period.value ? "primary" : "secondary"}
        >
          {period.label}
        </Button>
      ))}
    </div>
  )
}
