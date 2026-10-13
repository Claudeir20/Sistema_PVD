import { useState } from "react"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import { formatMoney } from "../../../domain/formatters"
import type { ServiceOrderBudgetItem } from "../../../services/serviceOrders"
import { calculateBudgetTotal } from "../budget"
import AddBudgetItemDialog from "./AddBudgetItemDialog"

interface BudgetSectionProps {
  items: readonly ServiceOrderBudgetItem[]
  onAddItem: (item: Omit<ServiceOrderBudgetItem, "id">) => void
}

export default function BudgetSection({
  items,
  onAddItem,
}: BudgetSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const total = calculateBudgetTotal(items)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between gap-4 border-b border-neutral-200 px-4 py-4">
        <h2 className="font-bold text-neutral-900">
          Orçamento — peças e serviços
        </h2>
        <Button
          className="no-print min-h-9 px-3 text-xs"
          onClick={() => setDialogOpen(true)}
        >
          Adicionar item
        </Button>
      </div>
      <div className="divide-y divide-neutral-200">
        {items.map((item) => (
          <div
            className="grid gap-2 px-4 py-3 sm:grid-cols-[80px_minmax(0,1fr)_auto]"
            key={item.id}
          >
            <Badge variant={item.kind === "PART" ? "info" : "neutral"}>
              {item.kind === "PART" ? "Peça" : "Serviço"}
            </Badge>
            <div>
              <p className="text-sm font-medium text-neutral-800">
                {item.description}
                {item.quantity > 1 ? ` × ${item.quantity}` : ""}
              </p>
              {item.note ? (
                <p className="mt-1 text-xs text-neutral-500">{item.note}</p>
              ) : null}
            </div>
            <span className="font-mono text-sm text-neutral-800">
              {formatMoney(item.priceInCents * item.quantity)}
            </span>
          </div>
        ))}
      </div>
      <div className="flex justify-end gap-4 border-t border-neutral-200 bg-neutral-50 px-4 py-4">
        <span className="font-medium text-neutral-700">Total</span>
        <span className="font-mono font-bold text-neutral-900">
          {formatMoney(total)}
        </span>
      </div>
      <AddBudgetItemDialog
        onAdd={(item) => {
          onAddItem(item)
          setDialogOpen(false)
        }}
        onClose={() => setDialogOpen(false)}
        open={dialogOpen}
      />
    </Card>
  )
}
