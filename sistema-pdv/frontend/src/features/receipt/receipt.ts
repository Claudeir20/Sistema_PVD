import { formatMoney } from "../../domain/formatters"
import { paymentMethodLabels } from "../../domain/paymentMethods"
import type { SaleResponse } from "../../services/sales"
import { formatCpf } from "../pos/customerCpf"

export interface ReceiptStore {
  name: string
  cnpj: string
  address: string
}

/** Uma linha "rótulo .... valor" do comprovante. */
export interface ReceiptLine {
  label: string
  value: string
  strong?: boolean
}

export interface ReceiptItem {
  name: string
  /** "2 x R$ 29,90" */
  detail: string
  total: string
}

/** Tudo o que o comprovante mostra, já formatado (o componente só desenha). */
export interface Receipt {
  store: ReceiptStore
  title: string
  number: string
  date: string
  canceled: boolean
  items: ReceiptItem[]
  totals: ReceiptLine[]
  payment: ReceiptLine[]
  footer: string[]
}

const dateTimeFormat = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
})

/** Monta o comprovante não fiscal de uma venda, na ordem em que sai na bobina. */
export function buildReceipt(sale: SaleResponse, store: ReceiptStore): Receipt {
  const totals: ReceiptLine[] = []
  if (sale.discountInCents > 0) {
    totals.push({ label: "Subtotal", value: formatMoney(sale.subtotalInCents) })
    totals.push({
      label: "Desconto",
      value: `- ${formatMoney(sale.discountInCents)}`,
    })
  }
  totals.push({
    label: "TOTAL",
    value: formatMoney(sale.totalInCents),
    strong: true,
  })

  const payment: ReceiptLine[] = [
    {
      label: "Pagamento",
      value: paymentMethodLabels[sale.paymentMethod],
    },
  ]
  if (sale.cashReceivedInCents !== null) {
    payment.push({
      label: "Recebido",
      value: formatMoney(sale.cashReceivedInCents),
    })
    payment.push({
      label: "Troco",
      value: formatMoney(sale.changeInCents ?? 0),
    })
  }
  if (sale.customerCpf) {
    payment.push({ label: "CPF", value: formatCpf(sale.customerCpf) })
  }
  payment.push({ label: "Vendedor", value: sale.sellerName })

  const canceled = sale.status === "CANCELED"
  const footer = ["Não é documento fiscal"]
  if (canceled) {
    footer.unshift(
      sale.canceledAt
        ? `Venda cancelada em ${dateTimeFormat.format(new Date(sale.canceledAt))}`
        : "Venda cancelada",
    )
  } else {
    footer.push("Obrigado pela preferência!")
  }

  return {
    store,
    title: canceled ? "VENDA CANCELADA" : "COMPROVANTE DE VENDA",
    number: sale.number,
    date: dateTimeFormat.format(new Date(sale.createdAt)),
    canceled,
    items: sale.items.map((item) => ({
      name: item.productName,
      detail: `${item.quantity} x ${formatMoney(item.unitPriceInCents)}`,
      total: formatMoney(item.totalInCents),
    })),
    totals,
    payment,
    footer,
  }
}
