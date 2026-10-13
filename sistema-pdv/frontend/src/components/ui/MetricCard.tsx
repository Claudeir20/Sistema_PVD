import type { ReactNode } from "react"
import Card from "./Card"

interface MetricCardProps {
  label: string
  value: ReactNode
  helper?: ReactNode
  className?: string
}

export default function MetricCard({
  label,
  value,
  helper,
  className = "",
}: MetricCardProps) {
  return (
    <Card className={`p-4 ${className}`}>
      <p className="text-sm font-medium text-neutral-500">{label}</p>
      <div className="mt-2 text-2xl font-bold tracking-tight text-neutral-900">
        {value}
      </div>
      {helper ? (
        <div className="mt-2 text-xs text-neutral-500">{helper}</div>
      ) : null}
    </Card>
  )
}
