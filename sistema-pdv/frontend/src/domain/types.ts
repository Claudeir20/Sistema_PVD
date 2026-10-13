import type { ServiceOrderStatus } from "./serviceOrderStatus"

export type PublicBudgetItemKind = "PART" | "SERVICE"

export interface PublicBudgetItem {
  id: string
  kind: PublicBudgetItemKind
  description: string
  priceInCents: number
}

export interface PublicStore {
  name: string
  address: string
  whatsapp: string
}

export interface PublicServiceOrder {
  token: string
  orderNumber: string
  device: string
  status: ServiceOrderStatus
  budgetDecision?: CustomerDecision
  expectedDelivery: string
  store: PublicStore
  budgetItems: PublicBudgetItem[]
}

export type CustomerDecision = "APPROVED" | "DECLINED"

export interface Product {
  id: string
  barcode: string
  name: string
  priceInCents: number
  stock: number
  minStock: number
}

export interface PosCustomer {
  name?: string
  cpf: string
}

export type PaymentMethod = "CASH" | "PIX" | "DEBIT" | "CREDIT"
