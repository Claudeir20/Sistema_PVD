export function normalizeCpf(value: string) {
  return value.replace(/\D/g, "")
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
