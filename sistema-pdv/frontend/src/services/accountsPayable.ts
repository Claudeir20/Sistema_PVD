export interface AccountPayable {
  id: string
  supplier: string
  dueDate: Date
  amountInCents: number
}

function daysFromNow(days: number) {
  const date = new Date()
  date.setHours(12, 0, 0, 0)
  date.setDate(date.getDate() + days)
  return date
}

export const accountsPayable: AccountPayable[] = [
  {
    id: "payable-1",
    supplier: "Distribuidora Mobile",
    dueDate: daysFromNow(1),
    amountInCents: 84500,
  },
  {
    id: "payable-2",
    supplier: "Aluguel",
    dueDate: daysFromNow(3),
    amountInCents: 280000,
  },
  {
    id: "payable-3",
    supplier: "Energia",
    dueDate: daysFromNow(5),
    amountInCents: 38740,
  },
  {
    id: "payable-4",
    supplier: "Fornecedor de peças",
    dueDate: daysFromNow(7),
    amountInCents: 126900,
  },
  {
    id: "payable-5",
    supplier: "Internet",
    dueDate: daysFromNow(12),
    amountInCents: 12990,
  },
]
