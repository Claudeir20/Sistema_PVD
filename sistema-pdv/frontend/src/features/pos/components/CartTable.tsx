import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import { formatMoney } from "../../../domain/formatters"
import type { CartItem } from "../cart"

interface CartTableProps {
  items: readonly CartItem[]
  locked?: boolean
  onRemove: (productId: string) => void
}

export default function CartTable({
  items,
  locked = false,
  onRemove,
}: CartTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] border-collapse text-left">
          <thead>
            <tr className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
              <th className="px-4 py-3 font-semibold">#</th>
              <th className="px-4 py-3 font-semibold">Produto</th>
              <th className="px-4 py-3 font-semibold">Qtd.</th>
              <th className="px-4 py-3 font-semibold">Unit.</th>
              <th className="px-4 py-3 text-right font-semibold">Total</th>
              <th className="px-4 py-3">
                <span className="sr-only">Ações</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-14 text-center text-sm text-neutral-500"
                  colSpan={6}
                >
                  O carrinho está vazio. Bipe um produto para começar.
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  className="border-b border-neutral-200 last:border-b-0"
                  key={item.product.id}
                >
                  <td className="px-4 py-3 text-sm text-neutral-500">
                    {index + 1}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-neutral-800">
                    {item.product.name}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-3 font-mono text-sm">
                    {formatMoney(item.product.priceInCents)}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-sm">
                    {formatMoney(item.product.priceInCents * item.quantity)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {locked ? (
                      <span className="text-xs text-neutral-400">
                        Bloqueado
                      </span>
                    ) : (
                      <Button
                        aria-label={`Remover ${item.product.name}`}
                        className="min-h-8 px-3 text-xs"
                        onClick={() => onRemove(item.product.id)}
                        variant="danger"
                      >
                        Remover
                      </Button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
