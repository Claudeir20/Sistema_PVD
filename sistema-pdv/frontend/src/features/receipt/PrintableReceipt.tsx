import { createPortal } from "react-dom"
import type { Receipt, ReceiptLine } from "./receipt"

/**
 * O comprovante na largura da bobina. Fica fora do #root (portal no body) e só
 * aparece na impressão: o CSS de print esconde o app e mostra só ele.
 */
export default function PrintableReceipt({
  receipt,
  width,
}: {
  receipt: Receipt
  width: "80mm" | "58mm"
}) {
  return createPortal(
    <div className="receipt-print" data-width={width} style={{ width }}>
      {/* A folha da impressão tem a largura da bobina, sem margens. */}
      <style>{`@page { size: ${width} auto; margin: 0; }`}</style>
      {/* div, não header: o CSS de impressão antigo esconde "body > div > header". */}
      <div className="receipt-center">
        <p className="receipt-strong receipt-big">{receipt.store.name}</p>
        {receipt.store.cnpj ? <p>CNPJ {receipt.store.cnpj}</p> : null}
        {receipt.store.address ? <p>{receipt.store.address}</p> : null}
      </div>

      <hr />
      <p className="receipt-center receipt-strong">{receipt.title}</p>
      <Row label={receipt.number} value={receipt.date} />
      <hr />

      {receipt.items.map((item, index) => (
        <div className="receipt-item" key={index}>
          <p>{item.name}</p>
          <Row label={item.detail} value={item.total} />
        </div>
      ))}

      <hr />
      {receipt.totals.map((line) => (
        <Row key={line.label} {...line} />
      ))}
      <hr />
      {receipt.payment.map((line) => (
        <Row key={line.label} {...line} />
      ))}
      <hr />

      <div className="receipt-center">
        {receipt.footer.map((text) => (
          <p className={receipt.canceled ? "receipt-strong" : ""} key={text}>
            {text}
          </p>
        ))}
      </div>
    </div>,
    document.body,
  )
}

function Row({ label, value, strong }: ReceiptLine) {
  return (
    <p className={`receipt-row ${strong ? "receipt-strong receipt-big" : ""}`}>
      <span>{label}</span>
      <span>{value}</span>
    </p>
  )
}
