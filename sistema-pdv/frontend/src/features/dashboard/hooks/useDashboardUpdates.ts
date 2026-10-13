import { useSyncExternalStore } from "react"
import {
  getProductsVersion,
  subscribeProducts,
} from "../../../services/products"
import { getSalesVersion, subscribeSales } from "../../../services/sales"

export default function useDashboardUpdates() {
  useSyncExternalStore(subscribeSales, getSalesVersion, getSalesVersion)
  useSyncExternalStore(
    subscribeProducts,
    getProductsVersion,
    getProductsVersion,
  )
}
