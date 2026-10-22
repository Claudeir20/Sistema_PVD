import { useEffect, useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import {
  centsToInput,
  formatMoney,
  parseMoneyToCents,
} from "../../../domain/formatters"

interface DiscountDialogProps {
  currentDiscountInCents: number
  open: boolean
  subtotalInCents: number
  onApply: (discountInCents: number) => void
  onClose: () => void
}

export default function DiscountDialog({
  currentDiscountInCents,
  open,
  subtotalInCents,
  onApply,
  onClose,
}: DiscountDialogProps) {
  const [value, setValue] = useState("")

  useEffect(() => {
    if (open) setValue(centsToInput(currentDiscountInCents))
  }, [currentDiscountInCents, open])

  return (
    <Dialog onClose={onClose} open={open} title="Aplicar desconto">
      <p className="text-sm text-neutral-600">
        Subtotal atual: {formatMoney(subtotalInCents)}
      </p>
      <label className="mt-4 block">
        <span className="mb-1.5 block text-sm font-medium text-neutral-700">
          Desconto em reais
        </span>
        <div className="flex h-11 items-center rounded-lg border border-neutral-300 bg-white px-3 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
          <span className="text-sm text-neutral-500">R$</span>
          <input
            autoFocus
            className="h-full min-w-0 flex-1 px-2 outline-none"
            inputMode="decimal"
            onChange={(event) => setValue(event.target.value)}
            placeholder="0,00"
            value={value}
          />
        </div>
      </label>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button onClick={onClose}>Cancelar</Button>
        <Button
          onClick={() => onApply(parseMoneyToCents(value) ?? 0)}
          variant="primary"
        >
          Aplicar
        </Button>
      </div>
    </Dialog>
  )
}
