import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import type { PaymentMethod } from "../../../domain/types"
import type { PixPayment } from "../../../services/payments"
import CashPayment from "./CashPayment"
import PixPaymentStatus from "./PixPaymentStatus"

const methods: Array<{ label: string; value: PaymentMethod }> = [
  { label: "Dinheiro", value: "CASH" },
  { label: "Pix", value: "PIX" },
  { label: "Débito", value: "DEBIT" },
  { label: "Crédito", value: "CREDIT" },
]

interface PaymentMethodsProps {
  disabled?: boolean
  loadingPix: boolean
  method: PaymentMethod
  pixPayment: PixPayment | null
  showPixPayment: boolean
  onChange: (method: PaymentMethod) => void
  totalInCents: number
  cashReceived: string
  onCashReceivedChange: (value: string) => void
}

export default function PaymentMethods({
  disabled = false,
  loadingPix,
  method,
  pixPayment,
  showPixPayment,
  onChange,
  totalInCents,
  cashReceived,
  onCashReceivedChange,
}: PaymentMethodsProps) {
  return (
    <Card className="p-4">
      <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
        Forma de pagamento
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {methods.map((item) => (
          <Button
            disabled={disabled}
            key={item.value}
            onClick={() => onChange(item.value)}
            variant={method === item.value ? "primary" : "secondary"}
          >
            {item.label}
          </Button>
        ))}
      </div>
      {method === "CASH" ? (
        <CashPayment
          disabled={disabled}
          onChange={onCashReceivedChange}
          totalInCents={totalInCents}
          value={cashReceived}
        />
      ) : null}
      {method === "PIX" ? (
        showPixPayment ? (
          <PixPaymentStatus loading={loadingPix} payment={pixPayment} />
        ) : (
          <div className="mt-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-3">
            <p className="text-sm font-medium text-blue-800">Pix selecionado</p>
            <p className="mt-1 text-xs text-blue-700">
              Finalize a venda para gerar o QR de pagamento.
            </p>
          </div>
        )
      ) : null}
    </Card>
  )
}
