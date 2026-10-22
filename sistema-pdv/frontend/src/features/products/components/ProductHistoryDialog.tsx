import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import {
  fetchProductMovements,
  type ProductMovement,
  type ProductResponse,
  type StockMovementType,
} from "../../../services/products"

const movementLabels: Record<StockMovementType, string> = {
  ENTRY: "Entrada",
  EXIT: "Saída",
  ADJUSTMENT: "Ajuste",
  SALE: "Venda",
  SALE_CANCELLATION: "Venda cancelada",
}

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
})

interface ProductHistoryDialogProps {
  product: ProductResponse | null
  onClose: () => void
}

/** Todas as entradas e saídas do produto, da mais nova para a mais antiga. */
export default function ProductHistoryDialog({
  product,
  onClose,
}: ProductHistoryDialogProps) {
  const [movements, setMovements] = useState<ProductMovement[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!product) return
    let ignore = false // fechou ou trocou de produto antes da resposta: descarta
    setLoading(true)
    setError("")
    setMovements([])

    fetchProductMovements(product.id)
      .then((result) => {
        if (!ignore) setMovements(result)
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setError(
            err instanceof Error ? err.message : "Não foi possível carregar.",
          )
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false)
      })

    return () => {
      ignore = true
    }
  }, [product])

  return (
    <Dialog
      onClose={onClose}
      open={product !== null}
      title={`Histórico — ${product?.name ?? ""}`}
    >
      {loading ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : null}
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {!loading && !error && movements.length === 0 ? (
        <p className="text-sm text-neutral-500">Nenhuma movimentação ainda.</p>
      ) : null}

      {movements.length > 0 ? (
        <ul className="max-h-80 divide-y divide-neutral-200 overflow-y-auto">
          {movements.map((movement) => (
            <li
              className="flex items-start justify-between gap-3 py-2.5"
              key={`${movement.movementId}-${movement.date}`}
            >
              <div className="min-w-0">
                <p className="text-sm font-medium text-neutral-900">
                  {movementLabels[movement.type]}
                </p>
                <p className="text-xs text-neutral-500">
                  {dateTimeFormat.format(new Date(movement.date))}
                  {movement.observation ? ` · ${movement.observation}` : ""}
                </p>
              </div>
              <div className="shrink-0 text-right">
                <p
                  className={`font-mono text-sm font-semibold ${
                    movement.quantity < 0 ? "text-red-700" : "text-emerald-700"
                  }`}
                >
                  {movement.quantity > 0 ? "+" : ""}
                  {movement.quantity}
                </p>
                <p className="text-xs text-neutral-500">
                  saldo {movement.balanceAfter}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4">
        <Button fullWidth onClick={onClose}>
          Fechar
        </Button>
      </div>
    </Dialog>
  )
}
