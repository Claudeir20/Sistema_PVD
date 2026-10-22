import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { ProductResponse } from "../../../services/products"

interface ArchiveProductDialogProps {
  product: ProductResponse | null
  onClose: () => void
  onConfirm: () => Promise<void>
}

/** Arquivar não apaga: o produto some do PDV, mas continua no histórico das vendas. */
export default function ArchiveProductDialog({
  product,
  onClose,
  onConfirm,
}: ArchiveProductDialogProps) {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (product) setError("")
  }, [product])

  async function confirm() {
    setSaving(true)
    setError("")
    try {
      await onConfirm()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível arquivar.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onClose={onClose} open={product !== null} title="Arquivar produto">
      <p className="text-sm leading-6 text-neutral-600">
        <strong className="text-neutral-900">{product?.name}</strong> deixa de
        aparecer no PDV. As vendas e o histórico de estoque continuam guardados.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button disabled={saving} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          disabled={saving}
          onClick={() => void confirm()}
          variant="danger"
        >
          {saving ? "Arquivando..." : "Arquivar"}
        </Button>
      </div>
    </Dialog>
  )
}
