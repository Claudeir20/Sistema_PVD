export const saleStatuses = [
  "EDITING",
  "AWAITING_PAYMENT",
  "COMPLETED",
] as const

export type SaleStatus = (typeof saleStatuses)[number]

export type SaleStatusEvent =
  | "START_PIX_PAYMENT"
  | "PAYMENT_CONFIRMED"
  | "REGISTRATION_FAILED"
  | "CANCEL_PAYMENT"
  | "COMPLETE_SALE"
  | "START_NEW_SALE"

const transitions: Record<
  SaleStatus,
  Partial<Record<SaleStatusEvent, SaleStatus>>
> = {
  EDITING: {
    START_PIX_PAYMENT: "AWAITING_PAYMENT",
    COMPLETE_SALE: "COMPLETED",
  },
  AWAITING_PAYMENT: {
    PAYMENT_CONFIRMED: "COMPLETED",
    REGISTRATION_FAILED: "AWAITING_PAYMENT",
    CANCEL_PAYMENT: "EDITING",
  },
  COMPLETED: {
    START_NEW_SALE: "EDITING",
  },
}

export function transitionSaleStatus(
  currentStatus: SaleStatus,
  event: SaleStatusEvent,
) {
  return transitions[currentStatus][event] ?? currentStatus
}

export function isSaleLocked(status: SaleStatus) {
  return status === "AWAITING_PAYMENT"
}
