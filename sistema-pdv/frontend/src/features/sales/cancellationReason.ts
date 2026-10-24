/** Sugestões de um toque; o admin também pode escrever outro motivo. */
export const QUICK_CANCELLATION_REASONS = [
  "Cliente desistiu",
  "Erro de digitação",
  "Pagamento recusado",
]

export const CANCELLATION_REASON_MAX = 200

/** Mesma regra do backend (3 a 200 caracteres, sem contar os espaços das pontas). */
export function cancellationReasonError(reason: string): string | null {
  const trimmed = reason.trim()
  if (trimmed.length < 3) return "Informe o motivo do cancelamento."
  if (trimmed.length > CANCELLATION_REASON_MAX) {
    return "O motivo deve ter de 3 a 200 caracteres."
  }
  return null
}
