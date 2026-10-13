import Button from "../../../components/ui/Button"
import type { PublicStore } from "../../../domain/types"

interface WhatsAppContactButtonProps {
  orderNumber: string
  store: PublicStore
}

export default function WhatsAppContactButton({
  orderNumber,
  store,
}: WhatsAppContactButtonProps) {
  const message = encodeURIComponent(
    `Olá! Gostaria de falar sobre a ordem de serviço #${orderNumber}.`,
  )
  const whatsappUrl = `https://wa.me/${store.whatsapp}?text=${message}`

  return (
    <Button
      fullWidth
      className="min-h-[52px]"
      onClick={() => window.open(whatsappUrl, "_blank", "noopener,noreferrer")}
    >
      Falar com a loja no WhatsApp
    </Button>
  )
}
