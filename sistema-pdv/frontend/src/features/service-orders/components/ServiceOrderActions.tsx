import Button from "../../../components/ui/Button"
import {
  canAdvance,
  nextStatus,
  serviceOrderStatusLabels,
  type ServiceOrderStatus,
} from "../../../domain/serviceOrderStatus"

interface ServiceOrderActionsProps {
  customerPhone: string
  orderNumber: string
  status: ServiceOrderStatus
  token: string
  onAdvance: () => void
}

export default function ServiceOrderActions({
  customerPhone,
  orderNumber,
  status,
  token,
  onAdvance,
}: ServiceOrderActionsProps) {
  const targetStatus = nextStatus(status)
  const trackingUrl = `${window.location.origin}/acompanhar/${token}`
  const whatsappMessage = encodeURIComponent(
    `Olá! Acompanhe a OS #${orderNumber} por este link: ${trackingUrl}`,
  )
  const whatsappUrl = `https://wa.me/55${customerPhone.replace(/\D/g, "")}?text=${whatsappMessage}`

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Button onClick={() => window.print()}>Imprimir via do cliente</Button>
      <Button
        onClick={() =>
          window.open(whatsappUrl, "_blank", "noopener,noreferrer")
        }
      >
        Enviar link no WhatsApp
      </Button>
      {canAdvance(status, targetStatus) && targetStatus ? (
        <Button onClick={onAdvance} variant="primary">
          Avançar para: {serviceOrderStatusLabels[targetStatus]}
        </Button>
      ) : null}
    </div>
  )
}
