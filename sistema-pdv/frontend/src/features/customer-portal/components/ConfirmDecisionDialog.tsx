import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { CustomerDecision } from "../../../domain/types"

interface ConfirmDecisionDialogProps {
  decision: CustomerDecision | null
  submitting: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function ConfirmDecisionDialog({
  decision,
  submitting,
  onClose,
  onConfirm,
}: ConfirmDecisionDialogProps) {
  const isApproval = decision === "APPROVED"

  return (
    <Dialog
      open={decision !== null}
      title={isApproval ? "Aprovar orçamento?" : "Recusar orçamento?"}
      onClose={onClose}
    >
      <p className="text-sm leading-6 text-[#62635f]">
        {isApproval
          ? "Ao confirmar, a loja poderá iniciar o reparo descrito neste orçamento."
          : "Ao confirmar, a loja será avisada de que você não aprovou este orçamento."}
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button disabled={submitting} onClick={onClose}>
          Voltar
        </Button>
        <Button
          disabled={submitting}
          onClick={onConfirm}
          variant={isApproval ? "primary" : "danger"}
        >
          {submitting ? "Enviando..." : "Confirmar"}
        </Button>
      </div>
    </Dialog>
  )
}
