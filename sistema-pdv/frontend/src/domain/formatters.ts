export function formatMoney(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(valueInCents / 100)
}

/**
 * Valor digitado em reais → centavos. Aceita "29,90", "29.90", "1.234,56" e "29".
 * Com vírgula, ela é o decimal e os pontos são milhar; sem vírgula, um ponto
 * seguido de 1 ou 2 dígitos no fim é o decimal. Inválido ou negativo vira null.
 */
export function parseMoneyToCents(value: string): number | null {
  const text = value.trim().replace(/^R\$\s*/, "")
  if (!text) return null

  let normalized: string
  if (text.includes(",")) {
    normalized = text.replace(/\./g, "").replace(",", ".")
  } else if (/\.\d{1,2}$/.test(text)) {
    normalized = text.replace(/\.(?=.*\.)/g, "")
  } else {
    normalized = text.replace(/\./g, "")
  }

  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null
  return Math.round(Number(normalized) * 100)
}

/** Centavos → texto para preencher um campo de valor: 2990 → "29,90". */
export function centsToInput(valueInCents: number) {
  return (valueInCents / 100).toFixed(2).replace(".", ",")
}

type DateValue = Date | string | number

function parseDate(value: DateValue) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T12:00:00`)
  }

  return new Date(value)
}

export function formatDate(value: DateValue) {
  return new Intl.DateTimeFormat("pt-BR").format(parseDate(value))
}

export function formatShortDate(value: DateValue) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
  }).format(parseDate(value))
}
