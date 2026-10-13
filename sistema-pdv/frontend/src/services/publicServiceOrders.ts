import type { CustomerDecision, PublicServiceOrder } from "../domain/types"
import { nextStatus } from "../domain/serviceOrderStatus"

function createPublicOrders(): Record<string, PublicServiceOrder> {
  return {
    "os-0001-demo": {
      token: "os-0001-demo",
      orderNumber: "0001",
      device: "iPhone 13 · Tela e bateria",
      status: "AWAITING_APPROVAL",
      expectedDelivery: "2026-03-13",
      store: {
        name: "Oficina Central",
        address: "Rua das Flores, 120 · Centro",
        whatsapp: "5511999999999",
      },
      budgetItems: [
        {
          id: "budget-part-screen",
          kind: "PART",
          description: "Tela OLED compatível",
          priceInCents: 38990,
        },
        {
          id: "budget-service-repair",
          kind: "SERVICE",
          description: "Mão de obra",
          priceInCents: 12000,
        },
      ],
    },
  }
}

let publicOrders = createPublicOrders()

function copyPublicOrder(order: PublicServiceOrder): PublicServiceOrder {
  return {
    ...order,
    store: { ...order.store },
    budgetItems: order.budgetItems.map((item) => ({ ...item })),
  }
}

export function resetPublicServiceOrdersForTests() {
  publicOrders = createPublicOrders()
}

export async function getPublicServiceOrderByToken(token: string) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 250))
  const order = publicOrders[token]
  return order ? copyPublicOrder(order) : null
}

export async function submitCustomerDecision(
  token: string,
  decision: CustomerDecision,
) {
  await new Promise((resolve) => globalThis.setTimeout(resolve, 500))

  const order = publicOrders[token]

  if (!order) {
    throw new Error("Ordem de serviço não encontrada.")
  }

  if (order.status !== "AWAITING_APPROVAL" || order.budgetDecision) {
    throw new Error("Esta ordem de serviço não aguarda uma decisão.")
  }

  const updatedOrder: PublicServiceOrder = {
    ...order,
    budgetDecision: decision,
    status:
      decision === "APPROVED"
        ? (nextStatus(order.status) ?? order.status)
        : order.status,
  }

  publicOrders[token] = updatedOrder
  return copyPublicOrder(updatedOrder)
}
