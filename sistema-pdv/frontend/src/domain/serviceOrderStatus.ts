export const serviceOrderStatuses = [
  "OPEN",
  "DIAGNOSIS",
  "AWAITING_APPROVAL",
  "IN_REPAIR",
  "READY",
  "DELIVERED",
] as const

export type ServiceOrderStatus = (typeof serviceOrderStatuses)[number]

export const serviceOrderStatusLabels: Record<ServiceOrderStatus, string> = {
  OPEN: "Recebido na loja",
  DIAGNOSIS: "Diagnóstico",
  AWAITING_APPROVAL: "Aguardando aprovação",
  IN_REPAIR: "Em reparo",
  READY: "Pronto para retirada",
  DELIVERED: "Entregue",
}

export function getStatusIndex(status: ServiceOrderStatus) {
  return serviceOrderStatuses.indexOf(status)
}

export function nextStatus(
  status: ServiceOrderStatus,
): ServiceOrderStatus | null {
  const nextIndex = getStatusIndex(status) + 1
  return serviceOrderStatuses[nextIndex] ?? null
}

export function canAdvance(
  currentStatus: ServiceOrderStatus,
  targetStatus: ServiceOrderStatus | null = nextStatus(currentStatus),
) {
  return targetStatus !== null && nextStatus(currentStatus) === targetStatus
}
