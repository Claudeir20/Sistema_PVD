// @refresh reset
import { useState } from "react"
import { useParams } from "react-router-dom"
import Card from "../../components/ui/Card"
import {
  addServiceOrderBudgetItem,
  advanceServiceOrder,
  getServiceOrderById,
  updateServiceOrderDevice,
  type ServiceOrderBudgetItem,
} from "../../services/serviceOrders"
import AssignmentDeadlinesCard from "./components/AssignmentDeadlinesCard"
import BudgetSection from "./components/BudgetSection"
import CustomerCard from "./components/CustomerCard"
import DeviceForm from "./components/DeviceForm"
import HistoryCard from "./components/HistoryCard"
import ServiceOrderActions from "./components/ServiceOrderActions"
import StatusStepper from "./components/StatusStepper"

export default function ServiceOrderPage() {
  const { id = "" } = useParams()
  const [order, setOrder] = useState(() => getServiceOrderById(id))

  if (!order) {
    return (
      <main className="grid min-h-[70vh] flex-1 place-items-center p-5">
        <Card className="max-w-md p-6 text-center">
          <h1 className="text-xl font-bold text-neutral-900">
            Ordem de serviço não encontrada
          </h1>
          <p className="mt-2 text-sm text-neutral-500">
            Verifique o número informado e tente novamente.
          </p>
        </Card>
      </main>
    )
  }

  return (
    <main className="print-page min-w-0 flex-1 bg-[#f4f4f2] p-4 sm:p-6">
      <div className="mx-auto max-w-[1440px]">
        <header className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <p className="text-xs text-neutral-500">
              Ordens de serviço · OS #{order.id.padStart(4, "0")}
            </p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
              OS #{order.id.padStart(4, "0")} · {order.device}
            </h1>
          </div>
          <ServiceOrderActions
            customerPhone={order.customer.phone}
            onAdvance={() => setOrder(advanceServiceOrder(order.id))}
            orderNumber={order.id.padStart(4, "0")}
            status={order.status}
            token={order.token}
          />
        </header>

        <Card className="mt-5 overflow-x-auto p-4">
          <div className="min-w-[760px]">
            <StatusStepper
              currentStatus={order.status}
              orientation="horizontal"
            />
          </div>
        </Card>

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="min-w-0 space-y-5">
            <DeviceForm
              fields={{
                device: order.device,
                intakeCondition: order.intakeCondition,
                reportedIssue: order.reportedIssue,
                serialNumber: order.serialNumber,
              }}
              onChange={(fields) => {
                const updated = updateServiceOrderDevice(order.id, fields)
                setOrder(updated)
              }}
            />
            <BudgetSection
              items={order.budgetItems}
              onAddItem={(item: Omit<ServiceOrderBudgetItem, "id">) => {
                setOrder(addServiceOrderBudgetItem(order.id, item))
              }}
            />
          </div>

          <aside className="space-y-4">
            <CustomerCard customer={order.customer} />
            <AssignmentDeadlinesCard order={order} />
            <HistoryCard entries={order.history} />
          </aside>
        </div>
      </div>
    </main>
  )
}
