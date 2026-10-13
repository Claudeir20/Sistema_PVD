import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import Card from "../../../components/ui/Card"
import type { PublicServiceOrder } from "../../../domain/types"
import { getPublicServiceOrderByToken } from "../../../services/publicServiceOrders"
import StatusStepper from "../../service-orders/components/StatusStepper"
import CurrentStatusCard from "../components/CurrentStatusCard"
import PublicBudgetCard from "../components/PublicBudgetCard"
import StoreHeader from "../components/StoreHeader"
import WhatsAppContactButton from "../components/WhatsAppContactButton"

export default function CustomerTrackingPage() {
  const { token = "" } = useParams()
  const [order, setOrder] = useState<PublicServiceOrder | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    getPublicServiceOrderByToken(token).then((result) => {
      if (!active) return
      setOrder(result)
      setLoading(false)
    })

    return () => {
      active = false
    }
  }, [token])

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <p className="text-sm text-[#6e6f6a]">
          Carregando sua ordem de serviço...
        </p>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="grid min-h-dvh place-items-center px-5">
        <Card className="w-full max-w-sm p-6 text-center">
          <h1 className="text-lg font-bold">Link não encontrado</h1>
          <p className="mt-2 text-sm leading-6 text-[#6e6f6a]">
            Confira se o endereço recebido da loja está completo e tente
            novamente.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[470px] bg-[#f4f4f2] shadow-[0_0_40px_rgba(0,0,0,0.04)]">
      <StoreHeader store={order.store} />
      <div className="space-y-4 px-5 py-5">
        <header>
          <p className="text-xs text-[#6e6f6a]">
            Ordem de serviço #{order.orderNumber}
          </p>
          <h1 className="mt-1 text-[22px] font-bold leading-tight text-[#292927]">
            {order.device}
          </h1>
        </header>

        <CurrentStatusCard
          expectedDelivery={order.expectedDelivery}
          status={order.status}
        />

        <PublicBudgetCard order={order} onOrderUpdated={setOrder} />

        <Card className="p-4">
          <h2 className="mb-3 text-sm font-bold text-[#30302e]">Andamento</h2>
          <StatusStepper
            currentStatus={order.status}
            includeDelivered={false}
            orientation="vertical"
          />
        </Card>

        <WhatsAppContactButton
          orderNumber={order.orderNumber}
          store={order.store}
        />
      </div>
    </div>
  )
}
