import { useSyncExternalStore } from "react"
import { getSalesVersion, subscribeSales } from "../../../services/sales"

/** Redesenha o painel quando uma venda é registrada. Os produtos vêm do useProducts. */
export default function useDashboardUpdates() {
  useSyncExternalStore(subscribeSales, getSalesVersion, getSalesVersion)
}
