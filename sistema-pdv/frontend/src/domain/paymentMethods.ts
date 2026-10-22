import type { PaymentMethod } from "./types"

export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Dinheiro",
  PIX: "Pix",
  DEBIT: "Débito",
  CREDIT: "Crédito",
}
