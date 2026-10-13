import type { PixPayment } from "../../../services/payments"

interface PixPaymentStatusProps {
  loading: boolean
  payment: PixPayment | null
}

export default function PixPaymentStatus({
  loading,
  payment,
}: PixPaymentStatusProps) {
  return (
    <div className="mt-3 flex min-h-24 items-center gap-3 rounded-lg border border-dashed border-neutral-400 p-3">
      <div className="grid size-16 shrink-0 place-items-center border border-dashed border-neutral-500 text-center text-[10px] text-neutral-500">
        QR Pix
      </div>
      <div>
        <p className="text-sm font-medium text-neutral-800">
          {payment?.status === "CONFIRMED"
            ? "Pagamento recebido"
            : loading
              ? "Gerando cobrança Pix..."
              : "Aguardando pagamento do Pix"}
        </p>
        <p className="mt-1 text-xs leading-5 text-neutral-500">
          {payment?.status === "CONFIRMED"
            ? "A venda está aguardando conferência do registro."
            : payment
              ? "Pagamento simulado. A confirmação será recebida pelo sistema."
              : "Preparando os dados da cobrança."}
        </p>
      </div>
    </div>
  )
}
