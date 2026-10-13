import { useState } from "react"
import Button from "../../../components/ui/Button"
import type {
  CustomerDecision,
  PublicServiceOrder,
} from "../../../domain/types"
import { submitCustomerDecision } from "../../../services/publicServiceOrders"
import ConfirmDecisionDialog from "./ConfirmDecisionDialog"

interface ApprovalActionsProps {
  order: PublicServiceOrder
  onOrderUpdated: (order: PublicServiceOrder) => void
}

export default function ApprovalActions({
  order,
  onOrderUpdated,
}: ApprovalActionsProps) {
  const [pendingDecision, setPendingDecision] =
    useState<CustomerDecision | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function confirmDecision() {
    if (!pendingDecision) return

    try {
      setSubmitting(true)
      setError("")
      const updatedOrder = await submitCustomerDecision(
        order.token,
        pendingDecision,
      )
      onOrderUpdated(updatedOrder)
      setPendingDecision(null)
    } catch {
      setError("Não foi possível enviar sua resposta. Tente novamente.")
    } finally {
      setSubmitting(false)
    }
  }

  if (order.budgetDecision) {
    const wasApproved = order.budgetDecision === "APPROVED"

    return (
      <div
        className={`mt-4 rounded-lg px-4 py-3 text-sm font-medium ${
          wasApproved
            ? "bg-[#f0f3ed] text-[#3f5140]"
            : "bg-[#fff7e8] text-[#74520d]"
        }`}
        role="status"
      >
        {wasApproved
          ? "Orçamento aprovado. A loja já foi avisada."
          : "Orçamento recusado. Fale com a loja pelo WhatsApp para combinar os próximos passos."}
      </div>
    )
  }

  if (order.status !== "AWAITING_APPROVAL") return null

  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <Button
          fullWidth
          onClick={() => setPendingDecision("DECLINED")}
          variant="danger"
        >
          Recusar
        </Button>
        <Button
          fullWidth
          onClick={() => setPendingDecision("APPROVED")}
          variant="primary"
        >
          Aprovar
        </Button>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[#b42318]" role="alert">
          {error}
        </p>
      ) : null}
      <ConfirmDecisionDialog
        decision={pendingDecision}
        submitting={submitting}
        onClose={() => {
          if (!submitting) setPendingDecision(null)
        }}
        onConfirm={confirmDecision}
      />
    </>
  )
}
