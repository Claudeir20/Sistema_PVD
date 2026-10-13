import type { Product } from "../../domain/types"

export interface CartItem {
  product: Product
  quantity: number
}

export interface CartTotals {
  subtotalInCents: number
  discountInCents: number
  totalInCents: number
}

export function addCartItem(
  cart: readonly CartItem[],
  product: Product,
  quantity = 1,
): CartItem[] {
  const safeQuantity = Math.max(1, Math.floor(quantity))
  const existingItem = cart.find((item) => item.product.id === product.id)

  if (!existingItem) {
    const availableQuantity = Math.min(safeQuantity, product.stock)
    return availableQuantity > 0
      ? [...cart, { product, quantity: availableQuantity }]
      : [...cart]
  }

  return cart.map((item) =>
    item.product.id === product.id
      ? {
          ...item,
          quantity: Math.min(item.quantity + safeQuantity, item.product.stock),
        }
      : item,
  )
}

export function removeCartItem(
  cart: readonly CartItem[],
  productId: string,
): CartItem[] {
  return cart.filter((item) => item.product.id !== productId)
}

export function calculateSubtotal(cart: readonly CartItem[]) {
  return cart.reduce(
    (subtotal, item) => subtotal + item.product.priceInCents * item.quantity,
    0,
  )
}

export function calculateDiscount(
  subtotalInCents: number,
  requestedDiscountInCents: number,
) {
  return Math.min(
    Math.max(0, Math.trunc(requestedDiscountInCents)),
    subtotalInCents,
  )
}

export function calculateTotal(
  subtotalInCents: number,
  discountInCents: number,
) {
  return Math.max(0, subtotalInCents - discountInCents)
}

export function calculateCartTotals(
  cart: readonly CartItem[],
  requestedDiscountInCents = 0,
): CartTotals {
  const subtotalInCents = calculateSubtotal(cart)
  const discountInCents = calculateDiscount(
    subtotalInCents,
    requestedDiscountInCents,
  )

  return {
    subtotalInCents,
    discountInCents,
    totalInCents: calculateTotal(subtotalInCents, discountInCents),
  }
}

export function canFinalizeSale(
  cart: readonly CartItem[],
  requestedDiscountInCents = 0,
) {
  return (
    cart.length > 0 &&
    calculateCartTotals(cart, requestedDiscountInCents).totalInCents > 0
  )
}
