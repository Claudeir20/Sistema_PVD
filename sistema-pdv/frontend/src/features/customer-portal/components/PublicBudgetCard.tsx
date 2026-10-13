import Card from "../../../components/ui/Card"
import { formatMoney } from "../../../domain/formatters"
import type { PublicServiceOrder } from "../../../domain/types"
import { calculateBudgetTotal } from "../../service-orders/budget"
import ApprovalActions from "./ApprovalActions"

interface PublicBudgetCardProps {
  order: PublicServiceOrder
  onOrderUpdated: (order: PublicServiceOrder) => void
}

export default function PublicBudgetCard({
  order,
  onOrderUpdated,
}: PublicBudgetCardProps) {
  const total = calculateBudgetTotal(order.budgetItems)

  return (
    <Card className="p-4">
      <h2 className="text-sm font-bold text-[#30302e]">Orçamento</h2>
      <div className="mt-3 space-y-3">
        {order.budgetItems.map((item) => (
          <div
            className="flex items-start justify-between gap-4 text-sm"
            key={item.id}
          >
            <span className="min-w-0 text-[#3f403d]">{item.description}</span>
            <span className="shrink-0 font-mono text-[#30302e]">
              {formatMoney(item.priceInCents)}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-[#deded9] pt-3">
        <span className="font-bold text-[#30302e]">Total</span>
        <span className="font-mono font-bold text-[#30302e]">
          {formatMoney(total)}
        </span>
      </div>
      <ApprovalActions order={order} onOrderUpdated={onOrderUpdated} />
    </Card>
  )
}
