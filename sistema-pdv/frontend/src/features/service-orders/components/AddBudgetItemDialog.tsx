import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type {
  BudgetItemKind,
  ServiceOrderBudgetItem,
} from "../../../services/serviceOrders"

interface AddBudgetItemDialogProps {
  open: boolean
  onClose: () => void
  onAdd: (item: Omit<ServiceOrderBudgetItem, "id">) => void
}

export default function AddBudgetItemDialog({
  open,
  onClose,
  onAdd,
}: AddBudgetItemDialogProps) {
  const [kind, setKind] = useState<BudgetItemKind>("PART")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [quantity, setQuantity] = useState("1")

  useEffect(() => {
    if (!open) return
    setKind("PART")
    setDescription("")
    setPrice("")
    setQuantity("1")
  }, [open])

  const priceInCents = Math.round(Number(price.replace(",", ".")) * 100)
  const parsedQuantity = Number(quantity)
  const isValid =
    description.trim().length > 0 &&
    Number.isInteger(parsedQuantity) &&
    parsedQuantity > 0 &&
    Number.isFinite(priceInCents) &&
    priceInCents > 0

  const inputClass =
    "mt-1.5 h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

  return (
    <Dialog onClose={onClose} open={open} title="Adicionar item">
      <div className="grid grid-cols-2 gap-2">
        <Button
          onClick={() => setKind("PART")}
          variant={kind === "PART" ? "primary" : "secondary"}
        >
          Peça
        </Button>
        <Button
          onClick={() => setKind("SERVICE")}
          variant={kind === "SERVICE" ? "primary" : "secondary"}
        >
          Serviço
        </Button>
      </div>
      <label className="mt-4 block text-sm font-medium text-neutral-700">
        Descrição
        <input
          autoFocus
          className={inputClass}
          onChange={(event) => setDescription(event.target.value)}
          value={description}
        />
      </label>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <label className="block text-sm font-medium text-neutral-700">
          Valor unitário
          <input
            className={inputClass}
            inputMode="decimal"
            onChange={(event) => setPrice(event.target.value)}
            placeholder="0,00"
            value={price}
          />
        </label>
        <label className="block text-sm font-medium text-neutral-700">
          Quantidade
          <input
            className={inputClass}
            min={1}
            onChange={(event) => setQuantity(event.target.value)}
            type="number"
            value={quantity}
          />
        </label>
      </div>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          disabled={!isValid}
          onClick={() =>
            onAdd({
              kind,
              description: description.trim(),
              priceInCents,
              quantity: parsedQuantity,
            })
          }
          variant="primary"
        >
          Adicionar
        </Button>
      </div>
    </Dialog>
  )
}
