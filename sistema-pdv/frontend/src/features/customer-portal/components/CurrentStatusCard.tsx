import { formatShortDate } from "../../../domain/formatters"
import {
  serviceOrderStatusLabels,
  type ServiceOrderStatus,
} from "../../../domain/serviceOrderStatus"

interface CurrentStatusCardProps {
  status: ServiceOrderStatus
  expectedDelivery: string
}

export default function CurrentStatusCard({
  status,
  expectedDelivery,
}: CurrentStatusCardProps) {
  return (
    <section className="rounded-xl border-2 border-[#292927] bg-white p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-[#777873]">
        Status atual
      </p>
      <h2 className="mt-1 text-lg font-bold text-[#292927]">
        {serviceOrderStatusLabels[status]}
      </h2>
      <p className="mt-0.5 text-sm text-[#6e6f6a]">
        Previsão de entrega: {formatShortDate(expectedDelivery)}
      </p>
    </section>
  )
}
