export interface BudgetTotalItem {
  priceInCents: number
  quantity?: number
}

export function calculateBudgetTotal(items: readonly BudgetTotalItem[]) {
  return items.reduce(
    (total, item) => total + item.priceInCents * (item.quantity ?? 1),
    0,
  )
}
