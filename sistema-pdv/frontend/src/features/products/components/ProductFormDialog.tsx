import { useState, type FormEvent } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import { centsToInput, parseMoneyToCents } from "../../../domain/formatters"
import type {
  ProductFormData,
  ProductResponse,
} from "../../../services/products"

interface ProductFormDialogProps {
  /** null = novo produto; preenchido = edição desse produto. */
  product: ProductResponse | null
  /** Aviso vindo da página (ex.: os dados foram atualizados por um conflito). */
  notice?: string
  onClose: () => void
  /** Pode falhar (ex.: código duplicado): o erro aparece no próprio diálogo. */
  onSave: (data: ProductFormData) => Promise<void>
}

const inputClass =
  "h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 disabled:bg-neutral-100 disabled:text-neutral-500"

/**
 * Formulário de criar e editar produto. Cada campo é um useState: o que é digitado
 * fica guardado ali e a tela é redesenhada a cada tecla.
 *
 * A página só monta o diálogo quando ele abre (e com uma key por produto), então os
 * campos já nascem preenchidos — nada sobra do que foi digitado da vez anterior.
 */
export default function ProductFormDialog({
  product,
  notice,
  onClose,
  onSave,
}: ProductFormDialogProps) {
  const editing = product !== null
  const [barcode, setBarcode] = useState(product?.barcode ?? "")
  const [name, setName] = useState(product?.name ?? "")
  const [price, setPrice] = useState(
    product ? centsToInput(product.priceInCents) : "",
  )
  const [minStock, setMinStock] = useState(
    product ? String(product.minStock) : "",
  )
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()

    // Conferência rápida aqui; as regras de verdade (código único etc.) são do backend.
    const priceInCents = parseMoneyToCents(price)
    if (priceInCents === null || priceInCents <= 0) {
      setError("Informe um preço maior que zero, por exemplo 29,90.")
      return
    }
    const minStockNumber = Number(minStock)
    if (!Number.isInteger(minStockNumber) || minStockNumber < 0) {
      setError("O estoque mínimo deve ser um número inteiro, 0 ou mais.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave({
        barcode: barcode.trim(),
        name: name.trim(),
        priceInCents,
        minStock: minStockNumber,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog
      onClose={onClose}
      open
      title={editing ? "Editar produto" : "Novo produto"}
    >
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Código de barras
          </span>
          <input
            autoFocus={!editing}
            className={`${inputClass} font-mono`}
            disabled={editing}
            maxLength={50}
            onChange={(event) => setBarcode(event.target.value)}
            placeholder="Bipe ou digite o código"
            required
            value={barcode}
          />
          {editing ? (
            <span className="mt-1 block text-xs text-neutral-500">
              O código não muda depois do cadastro.
            </span>
          ) : null}
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nome
          </span>
          <input
            autoFocus={editing}
            className={inputClass}
            maxLength={120}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ex.: Cabo USB-C 1 m"
            required
            value={name}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">
              Preço (R$)
            </span>
            <input
              className={inputClass}
              inputMode="decimal"
              onChange={(event) => setPrice(event.target.value)}
              placeholder="0,00"
              required
              value={price}
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-neutral-700">
              Estoque mínimo
            </span>
            <input
              className={inputClass}
              inputMode="numeric"
              min={0}
              onChange={(event) => setMinStock(event.target.value)}
              placeholder="0"
              required
              step={1}
              type="number"
              value={minStock}
            />
          </label>
        </div>

        {!editing ? (
          <p className="text-xs text-neutral-500">
            O produto começa com estoque 0. Depois de salvar, use “Repor” para
            registrar a entrada.
          </p>
        ) : null}

        {notice && !error ? (
          <p className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
            {notice}
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={saving} type="submit" variant="primary">
            {saving ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
