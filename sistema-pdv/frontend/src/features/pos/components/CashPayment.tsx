import {
  centsToInput,
  formatMoney,
  parseMoneyToCents,
} from "../../../domain/formatters"
import { checkCashReceived, quickCashOptions } from "../cashPayment"

interface CashPaymentProps {
  totalInCents: number
  /** O texto digitado (ex.: "100" ou "100,00"); a conta é feita a cada tecla. */
  value: string
  disabled?: boolean
  onChange: (value: string) => void
}

/** Valor que o cliente entregou e o troco. Aparece quando "Dinheiro" está selecionado. */
export default function CashPayment({
  totalInCents,
  value,
  disabled = false,
  onChange,
}: CashPaymentProps) {
  const check = checkCashReceived(totalInCents, parseMoneyToCents(value))

  return (
    <div className="mt-3 rounded-lg border border-neutral-200 bg-neutral-50 p-3">
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium text-neutral-600">
          Valor recebido
        </span>
        <div className="flex h-12 items-center rounded-lg border border-neutral-300 bg-white px-3 focus-within:border-blue-600 focus-within:ring-4 focus-within:ring-blue-100">
          <span className="text-sm text-neutral-500">R$</span>
          <input
            aria-label="Valor recebido em dinheiro"
            autoFocus
            className="h-full min-w-0 flex-1 px-2 font-mono text-lg outline-none"
            disabled={disabled}
            inputMode="decimal"
            onChange={(event) => onChange(event.target.value)}
            onFocus={(event) => event.target.select()}
            placeholder="0,00"
            value={value}
          />
        </div>
      </label>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {quickCashOptions(totalInCents).map((amount, index) => (
          <button
            className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 hover:border-neutral-500 disabled:opacity-50"
            disabled={disabled}
            key={amount}
            onClick={() => onChange(centsToInput(amount))}
            type="button"
          >
            {index === 0 ? "Exato" : formatMoney(amount).replace(",00", "")}
          </button>
        ))}
      </div>

      {check.status === "OK" ? (
        <div className="mt-3 flex items-end justify-between">
          <span className="text-sm font-medium text-neutral-700">Troco</span>
          <span className="font-mono text-2xl font-bold text-emerald-700">
            {formatMoney(check.changeInCents)}
          </span>
        </div>
      ) : null}
      {check.status === "OK" && check.highChange ? (
        <p className="mt-1 text-xs font-medium text-amber-800" role="alert">
          Troco alto: confira o valor recebido.
        </p>
      ) : null}
      {check.status === "MISSING" ? (
        <p className="mt-3 text-sm font-medium text-red-700" role="alert">
          Faltam {formatMoney(check.missingInCents)}
        </p>
      ) : null}
      {check.status === "EMPTY" ? (
        <p className="mt-3 text-xs text-neutral-500">
          Informe quanto o cliente entregou para calcular o troco.
        </p>
      ) : null}
    </div>
  )
}
