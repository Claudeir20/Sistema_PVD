// @refresh reset
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import type { PaymentMethod, PosCustomer, Product } from "../../../domain/types"
import {
  createPixPayment,
  type PixPayment,
  waitForPixPaymentConfirmation,
} from "../../../services/payments"
import { products } from "../../../services/products"
import {
  registerSale,
  validateSaleStock,
  type RegisterSaleItem,
  type SaleResponse,
} from "../../../services/sales"
import {
  addCartItem,
  calculateCartTotals,
  canFinalizeSale,
  removeCartItem,
  type CartItem,
} from "../cart"
import { formatMoney, parseMoneyToCents } from "../../../domain/formatters"
import { checkCashReceived } from "../cashPayment"
import {
  isSaleLocked,
  transitionSaleStatus,
  type SaleStatus,
} from "../saleStatus"
import useReceiptPrinter from "../../receipt/useReceiptPrinter"
import useKeyboardShortcuts from "./useKeyboardShortcuts"

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload())
}

export default function usePosSale() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const paymentAttemptRef = useRef(0)
  const [cart, setCart] = useState<CartItem[]>([])
  const [quantity, setQuantity] = useState(1)
  const [discountInCents, setDiscountInCents] = useState(0)
  const [customer, setCustomer] = useState<PosCustomer | null>(null)
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX")
  // Texto do "Valor recebido" (só em dinheiro). Fica guardado ao trocar de forma.
  const [cashReceived, setCashReceived] = useState("")
  const [customerDialogOpen, setCustomerDialogOpen] = useState(false)
  const [discountDialogOpen, setDiscountDialogOpen] = useState(false)
  const [saleStatus, setSaleStatus] = useState<SaleStatus>("EDITING")
  const [pixPayment, setPixPayment] = useState<PixPayment | null>(null)
  const [loadingPix, setLoadingPix] = useState(false)
  const [notice, setNotice] = useState("")
  // A última venda concluída nesta tela: o caixa pode imprimir o comprovante dela.
  const [lastSale, setLastSale] = useState<SaleResponse | null>(null)
  const { printReceipt, receiptElement } = useReceiptPrinter()
  // Enquanto a API responde: impede o segundo clique (venda duplicada).
  const [submitting, setSubmitting] = useState(false)

  const totals = useMemo(
    () => calculateCartTotals(cart, discountInCents),
    [cart, discountInCents],
  )
  const cashReceivedInCents = parseMoneyToCents(cashReceived)
  // Em dinheiro, só finaliza com o valor recebido informado e suficiente.
  const cashIsOk =
    paymentMethod !== "CASH" ||
    checkCashReceived(totals.totalInCents, cashReceivedInCents).status === "OK"
  const canFinish = useMemo(
    () => !submitting && cashIsOk && canFinalizeSale(cart, discountInCents),
    [cart, discountInCents, submitting, cashIsOk],
  )
  const saleItems: RegisterSaleItem[] = cart.map((item) => ({
    productId: item.product.id,
    name: item.product.name,
    quantity: item.quantity,
    unitPriceInCents: item.product.priceInCents,
  }))
  const saleLocked = isSaleLocked(saleStatus)
  const paymentReceived =
    saleStatus === "AWAITING_PAYMENT" && pixPayment?.status === "CONFIRMED"

  const focusSearch = useCallback(() => {
    requestAnimationFrame(() => {
      searchInputRef.current?.focus()
      searchInputRef.current?.select()
    })
  }, [])

  useEffect(() => {
    focusSearch()
  }, [focusSearch])

  const openCustomer = useCallback(() => setCustomerDialogOpen(true), [])
  const openDiscount = useCallback(() => setDiscountDialogOpen(true), [])

  const completeSale = useCallback(
    async (event: "PAYMENT_CONFIRMED" | "COMPLETE_SALE") => {
      setSubmitting(true)
      try {
        const sale = await registerSale({
          items: saleItems,
          totals,
          paymentMethod,
          customer,
          cashReceivedInCents,
        })

        setSaleStatus((current) => transitionSaleStatus(current, event))
        setLastSale(sale.response)
        setCart([])
        setDiscountInCents(0)
        setCustomer(null)
        setCashReceived("")
        setLoadingPix(false)
        // O troco vem do backend: é o valor que ficou gravado na venda.
        setNotice(
          sale.changeInCents !== null
            ? `Venda concluída — ${sale.number} · Troco ${formatMoney(sale.changeInCents)}`
            : `Venda concluída — ${sale.number}`,
        )
        focusSearch()
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Não foi possível registrar a venda."

        if (event === "PAYMENT_CONFIRMED") {
          setSaleStatus((current) =>
            transitionSaleStatus(current, "REGISTRATION_FAILED"),
          )
          setLoadingPix(false)
          setNotice(
            `Pagamento recebido, mas a venda precisa de conferência: ${message}`,
          )
          return
        }

        paymentAttemptRef.current += 1
        setPixPayment(null)
        setLoadingPix(false)
        setNotice(message)
        focusSearch()
      } finally {
        setSubmitting(false)
      }
    },
    [
      cashReceivedInCents,
      customer,
      focusSearch,
      paymentMethod,
      saleItems,
      totals,
    ],
  )

  const finishSale = useCallback(() => {
    if (!canFinish) return

    if (paymentMethod === "PIX") {
      const stockValidation = validateSaleStock(saleItems, products)

      if (!stockValidation.valid) {
        setNotice(stockValidation.message)
        focusSearch()
        return
      }

      setCustomerDialogOpen(false)
      setDiscountDialogOpen(false)
      setSaleStatus((current) =>
        transitionSaleStatus(current, "START_PIX_PAYMENT"),
      )
      const paymentAttempt = ++paymentAttemptRef.current
      setPixPayment(null)
      setLoadingPix(true)
      setNotice("Aguardando pagamento do Pix")

      void (async () => {
        const payment = await createPixPayment(totals.totalInCents)
        if (paymentAttemptRef.current !== paymentAttempt) return

        setPixPayment(payment)
        setLoadingPix(false)

        const confirmedPayment = await waitForPixPaymentConfirmation(payment)
        if (paymentAttemptRef.current !== paymentAttempt) return

        setPixPayment(confirmedPayment)
        await completeSale("PAYMENT_CONFIRMED")
      })()
      return
    }

    void completeSale("COMPLETE_SALE")
  }, [
    canFinish,
    completeSale,
    focusSearch,
    paymentMethod,
    saleItems,
    totals.totalInCents,
  ])

  const cancelPixPayment = useCallback(() => {
    if (pixPayment?.status === "CONFIRMED") return

    paymentAttemptRef.current += 1
    setSaleStatus((current) => transitionSaleStatus(current, "CANCEL_PAYMENT"))
    setPixPayment(null)
    setLoadingPix(false)
    setNotice("Cobrança Pix cancelada. O carrinho está liberado.")
    focusSearch()
  }, [focusSearch, pixPayment])

  useKeyboardShortcuts({
    canFinish,
    disabled: saleLocked,
    onSearch: focusSearch,
    onCustomer: openCustomer,
    onDiscount: openDiscount,
    onFinish: finishSale,
    canPrint: lastSale !== null,
    onPrint: printLastReceipt,
  })

  function printLastReceipt() {
    if (lastSale) printReceipt(lastSale)
  }

  function addProduct(product: Product) {
    if (saleLocked) return "A venda está aguardando pagamento."

    const currentQuantity =
      cart.find((item) => item.product.id === product.id)?.quantity ?? 0

    if (currentQuantity + quantity > product.stock) {
      return `Estoque insuficiente. Disponível: ${product.stock}.`
    }

    if (saleStatus === "COMPLETED") {
      setSaleStatus((current) =>
        transitionSaleStatus(current, "START_NEW_SALE"),
      )
    }

    setCart((currentCart) => addCartItem(currentCart, product, quantity))
    setQuantity(1)
    setNotice(`${product.name} adicionado ao carrinho.`)
    focusSearch()
    return null
  }

  function removeProduct(productId: string) {
    if (saleLocked) return

    setCart((currentCart) => removeCartItem(currentCart, productId))
    setNotice("Item removido do carrinho.")
    focusSearch()
  }

  function saveCustomer(nextCustomer: PosCustomer) {
    setCustomer(nextCustomer)
    setCustomerDialogOpen(false)
    setNotice("Cliente identificado para esta venda.")
    focusSearch()
  }

  function applyDiscount(discount: number) {
    if (saleLocked) return

    setDiscountInCents(discount)
    setDiscountDialogOpen(false)
    setNotice("Desconto atualizado.")
    focusSearch()
  }

  return {
    addProduct,
    applyDiscount,
    canFinish,
    cancelPixPayment,
    cart,
    customer,
    customerDialogOpen,
    discountDialogOpen,
    finishSale,
    focusSearch,
    lastSale,
    loadingPix,
    notice,
    openCustomer,
    openDiscount,
    paymentMethod,
    paymentReceived,
    pixPayment,
    printLastReceipt,
    quantity,
    receiptElement,
    removeProduct,
    saleLocked,
    saveCustomer,
    searchInputRef,
    setCustomerDialogOpen,
    setDiscountDialogOpen,
    setPaymentMethod,
    cashReceived,
    setCashReceived,
    setQuantity,
    totals,
  }
}
