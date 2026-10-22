import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { Product } from "../../../domain/types"

interface RestockProductDialogProps {
  product: Product | null
  onClose: () => void
  /** Pode ser assíncrono: o diálogo espera e mostra o erro se falhar. */
  onConfirm: (quantity: number) => void | Promise<void>
}

export default function RestockProductDialog({
  product,
  onClose,
  onConfirm,
}: RestockProductDialogProps) {
  const [quantity, setQuantity] = useState("1")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const parsedQuantity = Number(quantity)
  const isValid = Number.isInteger(parsedQuantity) && parsedQuantity > 0

  useEffect(() => {
    if (product) {
      setQuantity("1")
      setError("")
    }
  }, [product])

  async function confirm() {
    setSaving(true)
    setError("")
    try {
      await onConfirm(parsedQuantity)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível registrar.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      onClose={onClose}
      open={product !== null}
      title="Registrar reposição"
    >
      <p className="text-sm leading-6 text-neutral-600">
        Informe quantas unidades de {product?.name ?? "produto"} foram
        recebidas.
      </p>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          Quantidade recebida
        </span>
        <input
          autoFocus
          className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
          min={1}
          onChange={(event) => setQuantity(event.target.value)}
          step={1}
          type="number"
          value={quantity}
        />
      </label>
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
          disabled={!isValid || saving}
          onClick={() => void confirm()}
          variant="primary"
        >
          {saving ? "Salvando..." : "Confirmar entrada"}
        </Button>
      </div>
    </Dialog>
  )
}
