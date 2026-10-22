import { useState, type FormEvent } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { ProductResponse } from "../../../services/products"

interface AdjustStockDialogProps {
  product: ProductResponse
  onClose: () => void
  onSave: (countedQuantity: number, reason: string) => Promise<void>
}

/** Motivos comuns, para não digitar sempre o mesmo texto. */
const quickReasons = [
  "Contagem de estoque",
  "Avaria",
  "Perda ou extravio",
  "Uso interno",
]

/** Mesmo limite do AdjustStockRequest no backend. */
const REASON_MAX = 150

/**
 * Ajuste por contagem: a pessoa informa quanto TEM na prateleira (não a diferença).
 * O sistema calcula e mostra a diferença antes de salvar.
 */
export default function AdjustStockDialog({
  product,
  onClose,
  onSave,
}: AdjustStockDialogProps) {
  const [counted, setCounted] = useState(String(product.stockQuantity))
  const [reason, setReason] = useState("")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  const countedNumber = Number(counted)
  const countedIsValid =
    counted.trim() !== "" &&
    Number.isInteger(countedNumber) &&
    countedNumber >= 0
  const difference = countedIsValid ? countedNumber - product.stockQuantity : 0

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!countedIsValid) {
      setError("Informe a quantidade contada: um número inteiro, 0 ou mais.")
      return
    }
    if (!reason.trim()) {
      setError("Informe o motivo do ajuste.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave(countedNumber, reason.trim())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível ajustar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onClose={onClose} open title={`Ajustar — ${product.name}`}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <p className="text-sm text-neutral-600">
          No sistema:{" "}
          <strong className="text-neutral-900">{product.stockQuantity}</strong>{" "}
          unidade{product.stockQuantity === 1 ? "" : "s"}. Informe quantas você
          contou.
        </p>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Quantidade contada
          </span>
          <input
            autoFocus
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 font-mono outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            min={0}
            onChange={(event) => {
              setCounted(event.target.value)
              setError("")
            }}
            onFocus={(event) => event.target.select()}
            step={1}
            type="number"
            value={counted}
          />
        </label>

        <DifferencePreview difference={difference} valid={countedIsValid} />

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Motivo
          </span>
          <input
            className="h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            maxLength={REASON_MAX}
            onChange={(event) => {
              setReason(event.target.value)
              setError("")
            }}
            placeholder="Por que o estoque mudou?"
            value={reason}
          />
        </label>
        <div className="flex flex-wrap gap-1.5">
          {quickReasons.map((quickReason) => (
            <button
              className={`rounded-full border px-2.5 py-1 text-xs ${
                reason === quickReason
                  ? "border-blue-600 bg-blue-50 text-blue-800"
                  : "border-neutral-300 text-neutral-600 hover:border-neutral-500"
              }`}
              key={quickReason}
              onClick={() => {
                setReason(quickReason)
                setError("")
              }}
              type="button"
            >
              {quickReason}
            </button>
          ))}
        </div>

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={saving || (countedIsValid && difference === 0)}
            type="submit"
            variant="primary"
          >
            {saving ? "Salvando..." : "Salvar ajuste"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

function DifferencePreview({
  difference,
  valid,
}: {
  difference: number
  valid: boolean
}) {
  if (!valid) return null
  if (difference === 0) {
    return (
      <p className="rounded-lg bg-neutral-100 px-3 py-2 text-sm text-neutral-600">
        Bate com o sistema: nada a ajustar.
      </p>
    )
  }
  const missing = difference < 0
  return (
    <p
      className={`rounded-lg px-3 py-2 text-sm ${
        missing ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"
      }`}
    >
      {missing ? "Faltam" : "Sobram"} <strong>{Math.abs(difference)}</strong> em
      relação ao sistema. O estoque passa a ser o contado.
    </p>
  )
}
