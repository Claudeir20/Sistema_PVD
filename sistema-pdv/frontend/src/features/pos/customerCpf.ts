export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "")
}

/** 52998224725 → 529.982.247-25 (para exibir; o backend guarda só os dígitos). */
export function formatCpf(value: string) {
  const cpf = normalizeCpf(value)
  if (cpf.length !== 11) return value
  return `${cpf.slice(0, 3)}.${cpf.slice(3, 6)}.${cpf.slice(6, 9)}-${cpf.slice(9)}`
}

function calculateDigit(cpf: string, factor: number) {
  let total = 0

  for (const digit of cpf) {
    if (factor > 1) {
      total += Number(digit) * factor
      factor -= 1
    }
  }

  const remainder = (total * 10) % 11
  return remainder === 10 ? 0 : remainder
}

export function isValidCpf(value: string) {
  const cpf = normalizeCpf(value)

  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) {
    return false
  }

  return (
    calculateDigit(cpf.slice(0, 9), 10) === Number(cpf[9]) &&
    calculateDigit(cpf.slice(0, 10), 11) === Number(cpf[10])
  )
}
