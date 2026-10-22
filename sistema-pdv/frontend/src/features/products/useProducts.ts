import { useEffect, useSyncExternalStore } from "react"
import {
  getProductsError,
  getProductsStatus,
  getProductsVersion,
  loadProducts,
  products,
  subscribeProducts,
} from "../../services/products"

/**
 * Produtos ativos do backend. Carrega na primeira tela que pedir e redesenha
 * quando mudam (reposição, venda). As telas só aparecem logado (RequireAuth).
 */
export default function useProducts() {
  useSyncExternalStore(
    subscribeProducts,
    getProductsVersion,
    getProductsVersion,
  )
  const status = getProductsStatus()

  useEffect(() => {
    if (getProductsStatus() === "IDLE") void loadProducts()
  }, [])

  return {
    products,
    status,
    error: getProductsError(),
    reload: loadProducts,
  }
}
