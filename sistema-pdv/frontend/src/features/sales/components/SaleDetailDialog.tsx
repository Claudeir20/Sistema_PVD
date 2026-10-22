import { useEffect, useState } from "react"
import Badge from "../../../components/ui/Badge"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import { formatMoney } from "../../../domain/formatters"
import { paymentMethodLabels } from "../../../domain/paymentMethods"
import {
  cancelSale,
  fetchSaleById,
  type SaleResponse,
} from "../../../services/sales"
import { formatCpf } from "../../pos/customerCpf"

interface SaleDetailDialogProps {
  saleId: string
  onClose: () => void
  /** Chamado depois de cancelar, para a lista atualizar. */
  onCanceled: (sale: SaleResponse) => void
}

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
})

/** Detalhe da venda e, para vendas concluídas, o cancelamento (com confirmação). */
export default function SaleDetailDialog({
  saleId,
  onClose,
  onCanceled,
}: SaleDetailDialogProps) {
  const [sale, setSale] = useState<SaleResponse | null>(null)
  const [loadError, setLoadError] = useState("")
  const [confirming, setConfirming] = useState(false)
  const [canceling, setCanceling] = useState(false)
  const [cancelError, setCancelError] = useState("")

  useEffect(() => {
    let ignore = false
    fetchSaleById(saleId)
      .then((result) => {
        if (!ignore) setSale(result)
      })
      .catch((err: unknown) => {
        if (!ignore) {
          setLoadError(
            err instanceof Error ? err.message : "Não foi possível carregar.",
          )
        }
      })
    return () => {
      ignore = true
    }
  }, [saleId])

  async function confirmCancel() {
    setCanceling(true)
    setCancelError("")
    try {
      const canceled = await cancelSale(saleId)
      setSale(canceled)
      setConfirming(false)
      onCanceled(canceled)
    } catch (err) {
      setCancelError(
        err instanceof Error ? err.message : "Não foi possível cancelar.",
      )
    } finally {
      setCanceling(false)
    }
  }

  return (
    <Dialog
      onClose={onClose}
      open
      size="md"
      title={sale ? `Venda ${sale.number}` : "Venda"}
    >
      {loadError ? (
        <p className="text-sm text-red-700" role="alert">
          {loadError}
        </p>
      ) : null}
      {!sale && !loadError ? (
        <p className="text-sm text-neutral-500">Carregando...</p>
      ) : null}

      {sale ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-sm text-neutral-600">
            {sale.status === "CANCELED" ? (
              <Badge variant="danger">Cancelada</Badge>
            ) : (
              <Badge variant="success">Concluída</Badge>
            )}
            <span>{dateTimeFormat.format(new Date(sale.createdAt))}</span>
            <span>·</span>
            <span>{paymentMethodLabels[sale.paymentMethod]}</span>
            <span>·</span>
            <span>Vendedor: {sale.sellerName}</span>
          </div>
          {sale.customerCpf ? (
            <p className="text-sm text-neutral-600">
              CPF na nota:{" "}
              <span className="font-mono">{formatCpf(sale.customerCpf)}</span>
            </p>
          ) : null}

          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="py-2 text-left font-medium">Produto</th>
                <th className="py-2 text-right font-medium">Qtd.</th>
                <th className="py-2 text-right font-medium">Unit.</th>
                <th className="py-2 text-right font-medium">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {sale.items.map((item) => (
                <tr key={item.productId}>
                  <td className="py-2 pr-2 text-neutral-900">
                    {item.productName}
                  </td>
                  <td className="py-2 text-right font-mono">{item.quantity}</td>
                  <td className="py-2 text-right font-mono">
                    {formatMoney(item.unitPriceInCents)}
                  </td>
                  <td className="py-2 text-right font-mono">
                    {formatMoney(item.totalInCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="space-y-1 border-t border-neutral-200 pt-3 text-sm">
            <div className="flex justify-between text-neutral-600">
              <dt>Subtotal</dt>
              <dd className="font-mono">{formatMoney(sale.subtotalInCents)}</dd>
            </div>
            {sale.discountInCents > 0 ? (
              <div className="flex justify-between text-neutral-600">
                <dt>Desconto</dt>
                <dd className="font-mono">
                  − {formatMoney(sale.discountInCents)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between text-base font-bold text-neutral-900">
              <dt>Total</dt>
              <dd className="font-mono">{formatMoney(sale.totalInCents)}</dd>
            </div>
          </dl>

          {confirming ? (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">
              <p>
                Cancelar a venda <strong>{sale.number}</strong>? Os itens voltam
                ao estoque e a venda sai do faturamento. Isso não pode ser
                desfeito.
              </p>
              <p className="mt-1 text-xs">
                Se o pagamento já entrou, faça a devolução do dinheiro ao
                cliente.
              </p>
              {cancelError ? (
                <p className="mt-2 font-semibold" role="alert">
                  {cancelError}
                </p>
              ) : null}
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Button
                  disabled={canceling}
                  onClick={() => setConfirming(false)}
                >
                  Voltar
                </Button>
                <Button
                  disabled={canceling}
                  onClick={() => void confirmCancel()}
                  variant="danger"
                >
                  {canceling ? "Cancelando..." : "Confirmar cancelamento"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={onClose}>Fechar</Button>
              {sale.status === "COMPLETED" ? (
                <Button onClick={() => setConfirming(true)} variant="danger">
                  Cancelar venda
                </Button>
              ) : null}
            </div>
          )}
        </div>
      ) : null}
    </Dialog>
  )
}
