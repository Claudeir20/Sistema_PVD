import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { Product } from "../../../domain/types"

interface RestockProductDialogProps {
  product: Product | null
  onClose: () => void
  onConfirm: (quantity: number) => void
}

export default function RestockProductDialog({
  product,
  onClose,
  onConfirm,
}: RestockProductDialogProps) {
  const [quantity, setQuantity] = useState("1")
  const parsedQuantity = Number(quantity)
  const isValid = Number.isInteger(parsedQuantity) && parsedQuantity > 0

  useEffect(() => {
    if (product) setQuantity("1")
  }, [product])

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
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!isValid}
          onClick={() => onConfirm(parsedQuantity)}
          variant="primary"
        >
          Confirmar entrada
        </Button>
      </div>
    </Dialog>
  )
}
