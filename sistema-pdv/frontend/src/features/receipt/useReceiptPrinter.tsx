import { useEffect, useState } from "react"
import {
  receiptWidth,
  storeAddress,
  storeCnpj,
  storeName,
} from "../../config/store"
import type { SaleResponse } from "../../services/sales"
import PrintableReceipt from "./PrintableReceipt"
import { buildReceipt } from "./receipt"

/**
 * Imprime o comprovante de uma venda: desenha o comprovante, abre a janela de
 * impressão do navegador e some depois. A impressora térmica é instalada no
 * Windows como uma impressora comum; é só escolhê-la (ou deixá-la como padrão).
 */
export default function useReceiptPrinter() {
  const [sale, setSale] = useState<SaleResponse | null>(null)

  useEffect(() => {
    if (!sale) return
    const clear = () => setSale(null)
    window.addEventListener("afterprint", clear)
    // Espera o comprovante entrar na página antes de abrir a impressão.
    const frame = requestAnimationFrame(() => window.print())
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("afterprint", clear)
    }
  }, [sale])

  const receiptElement = sale ? (
    <PrintableReceipt
      receipt={buildReceipt(sale, {
        name: storeName,
        cnpj: storeCnpj,
        address: storeAddress,
      })}
      width={receiptWidth}
    />
  ) : null

  return { printReceipt: setSale, receiptElement }
}
