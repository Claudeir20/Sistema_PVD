/** Acima disso o troco é "alto": a tela avisa para conferir (não bloqueia). */
export const HIGH_CHANGE_IN_CENTS = 20000

/** Notas comuns para os atalhos de valor recebido. */
const BILLS_IN_CENTS = [1000, 2000, 5000, 10000, 20000]

export type CashCheck =
  | { status: "EMPTY" }
  | { status: "MISSING"; missingInCents: number }
  | { status: "OK"; changeInCents: number; highChange: boolean }

/** Confere o valor recebido contra o total. null = campo vazio ou inválido. */
export function checkCashReceived(
  totalInCents: number,
  receivedInCents: number | null,
): CashCheck {
  if (receivedInCents === null) return { status: "EMPTY" }
  if (receivedInCents < totalInCents) {
    return { status: "MISSING", missingInCents: totalInCents - receivedInCents }
  }
  const changeInCents = receivedInCents - totalInCents
  return {
    status: "OK",
    changeInCents,
    highChange: changeInCents > HIGH_CHANGE_IN_CENTS,
  }
}

/**
 * Atalhos de valor recebido: o valor exato e as próximas notas acima do total
 * (para R$ 85,70: exato, R$ 100 e R$ 200). Notas abaixo do total não fazem sentido.
 */
export function quickCashOptions(totalInCents: number, limit = 3): number[] {
  if (totalInCents <= 0) return []
  const bills = BILLS_IN_CENTS.filter((bill) => bill > totalInCents).slice(
    0,
    limit,
  )
  return [totalInCents, ...bills]
}
