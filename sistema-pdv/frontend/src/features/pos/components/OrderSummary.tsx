import Card from "../../../components/ui/Card"
import { formatMoney } from "../../../domain/formatters"
import type { CartTotals } from "../cart"

interface OrderSummaryProps {
  totals: CartTotals
}

export default function OrderSummary({ totals }: OrderSummaryProps) {
  return (
    <Card className="p-4">
      <dl className="space-y-3 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-600">Subtotal</dt>
          <dd className="font-mono text-neutral-900">
            {formatMoney(totals.subtotalInCents)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-600">Desconto</dt>
          <dd className="font-mono text-neutral-900">
            − {formatMoney(totals.discountInCents)}
          </dd>
        </div>
        <div className="flex items-end justify-between gap-4 border-t border-neutral-200 pt-4">
          <dt className="font-bold text-neutral-900">Total</dt>
          <dd className="font-mono text-3xl font-bold tracking-tight text-neutral-900">
            {formatMoney(totals.totalInCents)}
          </dd>
        </div>
      </dl>
    </Card>
  )
}
