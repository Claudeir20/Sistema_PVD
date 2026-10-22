// @refresh reset
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import CartTable from "./components/CartTable"
import CustomerDialog from "./components/CustomerDialog"
import DiscountDialog from "./components/DiscountDialog"
import OrderSummary from "./components/OrderSummary"
import PaymentMethods from "./components/PaymentMethods"
import ProductSearch from "./components/ProductSearch"
import ShortcutBar from "./components/ShortcutBar"
import { formatCpf } from "./customerCpf"
import usePosSale from "./hooks/usePosSale"

if (import.meta.hot) {
  import.meta.hot.accept(() => window.location.reload())
}

export default function PosPage() {
  const sale = usePosSale()

  return (
    <main className="mx-auto grid w-full min-w-0 max-w-[1440px] gap-5 overflow-x-hidden p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="min-w-0 space-y-4">
        <ProductSearch
          disabled={sale.saleLocked}
          inputRef={sale.searchInputRef}
          onAddProduct={sale.addProduct}
          onQuantityChange={sale.setQuantity}
          quantity={sale.quantity}
        />

        <CartTable
          items={sale.cart}
          locked={sale.saleLocked}
          onRemove={sale.removeProduct}
        />

        <ShortcutBar
          canFinish={sale.canFinish}
          disabled={sale.saleLocked}
          onCustomer={sale.openCustomer}
          onDiscount={sale.openDiscount}
          onFinish={sale.finishSale}
          onSearch={sale.focusSearch}
        />

        {sale.notice ? (
          <p
            className="rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
            role="status"
          >
            {sale.notice}
          </p>
        ) : null}
      </section>

      <aside className="min-w-0 space-y-4 lg:sticky lg:top-5 lg:self-start">
        <Card className="p-4">
          <p className="text-[11px] font-medium uppercase tracking-wider text-neutral-500">
            Cliente (opcional)
          </p>
          {sale.customer ? (
            <div className="mt-3">
              <p className="text-sm text-neutral-500">CPF na nota</p>
              <p className="mt-1 font-mono font-semibold text-neutral-900">
                {formatCpf(sale.customer.cpf)}
              </p>
              <Button
                className="mt-3 min-h-9 px-3"
                disabled={sale.saleLocked}
                onClick={sale.openCustomer}
              >
                Alterar cliente
              </Button>
            </div>
          ) : (
            <Button
              className="mt-3 border-dashed"
              disabled={sale.saleLocked}
              fullWidth
              onClick={sale.openCustomer}
            >
              Identificar cliente (CPF na nota)
            </Button>
          )}
        </Card>

        <OrderSummary totals={sale.totals} />

        <PaymentMethods
          disabled={sale.saleLocked}
          loadingPix={sale.loadingPix}
          method={sale.paymentMethod}
          onChange={sale.setPaymentMethod}
          pixPayment={sale.pixPayment}
          showPixPayment={sale.saleLocked}
        />

        <Button
          className="min-h-14 text-base"
          disabled={
            sale.paymentReceived || (!sale.saleLocked && !sale.canFinish)
          }
          fullWidth
          onClick={sale.saleLocked ? sale.cancelPixPayment : sale.finishSale}
          variant={
            sale.saleLocked && !sale.paymentReceived ? "danger" : "primary"
          }
        >
          {sale.paymentReceived
            ? "Pagamento recebido"
            : sale.saleLocked
              ? "Cancelar cobrança"
              : "Finalizar venda (F10)"}
        </Button>

        <p className="text-center text-xs text-neutral-500">
          NFC-e emitida em segundo plano após a venda
        </p>
      </aside>

      <CustomerDialog
        customer={sale.customer}
        onClose={() => {
          sale.setCustomerDialogOpen(false)
          sale.focusSearch()
        }}
        onSave={sale.saveCustomer}
        open={sale.customerDialogOpen}
      />

      <DiscountDialog
        currentDiscountInCents={sale.totals.discountInCents}
        onApply={sale.applyDiscount}
        onClose={() => {
          sale.setDiscountDialogOpen(false)
          sale.focusSearch()
        }}
        open={sale.discountDialogOpen}
        subtotalInCents={sale.totals.subtotalInCents}
      />
    </main>
  )
}
