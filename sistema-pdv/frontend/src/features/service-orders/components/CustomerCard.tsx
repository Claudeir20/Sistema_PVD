import Card from "../../../components/ui/Card"
import { formatPhone } from "../../../domain/formatters"
import type { ServiceOrderDetail } from "../../../services/serviceOrders"

interface CustomerCardProps {
  customer: ServiceOrderDetail["customer"]
}

export default function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">
        Cliente
      </p>
      <p className="mt-3 font-bold text-neutral-900">{customer.name}</p>
      <p className="mt-1 text-sm text-neutral-600">
        {formatPhone(customer.phone)} · WhatsApp
      </p>
      <p className="mt-2 text-xs text-neutral-500">
        {customer.previousOrders} OS anteriores
      </p>
    </Card>
  )
}
