import Card from "../../../components/ui/Card"
import { formatDate } from "../../../domain/formatters"
import type { ServiceOrderDetail } from "../../../services/serviceOrders"

interface AssignmentDeadlinesCardProps {
  order: ServiceOrderDetail
}

export default function AssignmentDeadlinesCard({
  order,
}: AssignmentDeadlinesCardProps) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        Responsável e prazos
      </p>
      <dl className="mt-3 space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Técnico</dt>
          <dd className="font-medium text-neutral-800">{order.technician}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Entrada</dt>
          <dd>{formatDate(order.receivedAt)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Previsão</dt>
          <dd>{formatDate(order.expectedDelivery)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Garantia</dt>
          <dd>{order.warrantyDays} dias</dd>
        </div>
      </dl>
    </Card>
  )
}
