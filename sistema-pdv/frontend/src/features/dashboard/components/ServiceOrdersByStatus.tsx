import Badge from "../../../components/ui/Badge"
import Card from "../../../components/ui/Card"
import {
  serviceOrderStatuses,
  serviceOrderStatusLabels,
} from "../../../domain/serviceOrderStatus"
import type { DashboardServiceOrder } from "../../../services/serviceOrders"
import { countServiceOrdersByStatus } from "../dashboard"

interface ServiceOrdersByStatusProps {
  orders: readonly DashboardServiceOrder[]
}

export default function ServiceOrdersByStatus({
  orders,
}: ServiceOrdersByStatusProps) {
  const counts = countServiceOrdersByStatus(orders)

  return (
    <Card className="p-4 sm:p-5">
      <h2 className="font-bold text-neutral-900">OS por status</h2>
      <div className="mt-4 divide-y divide-neutral-200">
        {serviceOrderStatuses.map((status) => (
          <div
            className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
            key={status}
          >
            <span className="text-sm text-neutral-700">
              {serviceOrderStatusLabels[status]}
            </span>
            <Badge variant={status === "DELIVERED" ? "success" : "neutral"}>
              {counts[status] ?? 0}
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  )
}
