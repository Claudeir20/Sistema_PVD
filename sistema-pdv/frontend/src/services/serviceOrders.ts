import type { ServiceOrderStatus } from "../domain/serviceOrderStatus"
import { canAdvance, nextStatus } from "../domain/serviceOrderStatus"

export interface DashboardServiceOrder {
  id: string
  device: string
  status: ServiceOrderStatus
}

export const serviceOrders: DashboardServiceOrder[] = [
  { id: "1", device: "iPhone 13", status: "AWAITING_APPROVAL" },
  { id: "2", device: "Galaxy S22", status: "DIAGNOSIS" },
  { id: "3", device: "Notebook Lenovo", status: "IN_REPAIR" },
  { id: "4", device: "Moto G84", status: "READY" },
  { id: "5", device: "iPad Air", status: "DIAGNOSIS" },
  { id: "6", device: "MacBook Air", status: "IN_REPAIR" },
  { id: "7", device: "Galaxy A54", status: "OPEN" },
  { id: "8", device: "iPhone 11", status: "DELIVERED" },
]

export type BudgetItemKind = "PART" | "SERVICE"

export interface ServiceOrderBudgetItem {
  id: string
  kind: BudgetItemKind
  description: string
  priceInCents: number
  quantity: number
  note?: string
}

export interface ServiceOrderHistoryEntry {
  id: string
  description: string
  date: string
  user: string
}

export interface ServiceOrderDetail {
  id: string
  token: string
  status: ServiceOrderStatus
  device: string
  serialNumber: string
  reportedIssue: string
  intakeCondition: string
  customer: {
    name: string
    phone: string
    previousOrders: number
  }
  technician: string
  receivedAt: string
  expectedDelivery: string
  warrantyDays: number
  budgetItems: ServiceOrderBudgetItem[]
  history: ServiceOrderHistoryEntry[]
}

const serviceOrderDetails: Record<string, ServiceOrderDetail> = {
  "1": {
    id: "1",
    token: "os-0001-demo",
    status: "AWAITING_APPROVAL",
    device: "iPhone 13 · 128 GB · Azul",
    serialNumber: "359410120045678",
    reportedIssue:
      "Tela sem imagem após queda. O aparelho continua vibrando e recebendo ligações.",
    intakeCondition:
      "Risco leve na lateral direita, sem acessórios. Senha informada no atendimento.",
    customer: {
      name: "Mariana Alves",
      phone: "11987654321",
      previousOrders: 2,
    },
    technician: "Rafael Santos",
    receivedAt: "2026-03-18",
    expectedDelivery: "2026-03-24",
    warrantyDays: 90,
    budgetItems: [
      {
        id: "budget-screen",
        kind: "PART",
        description: "Tela OLED compatível",
        priceInCents: 38990,
        quantity: 1,
        note: "Baixa no estoque após aprovação",
      },
      {
        id: "budget-labor",
        kind: "SERVICE",
        description: "Substituição da tela",
        priceInCents: 12000,
        quantity: 1,
      },
    ],
    history: [
      {
        id: "history-1",
        description: "OS aberta no balcão",
        date: "2026-03-18T09:20:00",
        user: "Marina",
      },
      {
        id: "history-2",
        description: "Diagnóstico registrado",
        date: "2026-03-18T14:45:00",
        user: "Rafael",
      },
      {
        id: "history-3",
        description: "Orçamento enviado pelo WhatsApp",
        date: "2026-03-19T10:15:00",
        user: "Marina",
      },
    ],
  },
}

function copyServiceOrder(order: ServiceOrderDetail): ServiceOrderDetail {
  return {
    ...order,
    customer: { ...order.customer },
    budgetItems: order.budgetItems.map((item) => ({ ...item })),
    history: order.history.map((entry) => ({ ...entry })),
  }
}

export function getServiceOrderById(id: string) {
  const order = serviceOrderDetails[id]
  return order ? copyServiceOrder(order) : null
}

export function advanceServiceOrder(id: string) {
  const order = serviceOrderDetails[id]
  if (!order) throw new Error("Ordem de serviço não encontrada.")

  const targetStatus = nextStatus(order.status)
  if (!canAdvance(order.status, targetStatus) || !targetStatus) {
    return copyServiceOrder(order)
  }

  order.status = targetStatus
  order.history.unshift({
    id: `history-${Date.now()}`,
    description: `Status alterado para ${targetStatus}`,
    date: new Date().toISOString(),
    user: "Marina",
  })

  const summary = serviceOrders.find((item) => item.id === id)
  if (summary) summary.status = targetStatus
  return copyServiceOrder(order)
}

export function updateServiceOrderDevice(
  id: string,
  fields: Pick<
    ServiceOrderDetail,
    "device" | "serialNumber" | "reportedIssue" | "intakeCondition"
  >,
) {
  const order = serviceOrderDetails[id]
  if (!order) throw new Error("Ordem de serviço não encontrada.")
  Object.assign(order, fields)
  return copyServiceOrder(order)
}

export function addServiceOrderBudgetItem(
  id: string,
  item: Omit<ServiceOrderBudgetItem, "id">,
) {
  const order = serviceOrderDetails[id]
  if (!order) throw new Error("Ordem de serviço não encontrada.")

  order.budgetItems.push({
    ...item,
    id: `budget-${Date.now()}`,
  })
  return copyServiceOrder(order)
}
