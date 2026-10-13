import type { Product } from "../domain/types"

const initialProducts: Product[] = [
  {
    id: "cable-usbc",
    barcode: "7891000000011",
    name: "Cabo USB-C reforçado",
    priceInCents: 2990,
    stock: 18,
    minStock: 5,
  },
  {
    id: "screen-protector",
    barcode: "7891000000028",
    name: "Película de vidro 6,1”",
    priceInCents: 3990,
    stock: 4,
    minStock: 6,
  },
  {
    id: "cable-lightning",
    barcode: "7891000000066",
    name: "Cabo Lightning reforçado",
    priceInCents: 3490,
    stock: 3,
    minStock: 4,
  },
  {
    id: "charger-20w",
    barcode: "7891000000035",
    name: "Carregador rápido 20W",
    priceInCents: 8990,
    stock: 2,
    minStock: 3,
  },
  {
    id: "headphones",
    barcode: "7891000000042",
    name: "Fone de ouvido com microfone",
    priceInCents: 6490,
    stock: 10,
    minStock: 4,
  },
  {
    id: "phone-case",
    barcode: "7891000000059",
    name: "Capa protetora transparente",
    priceInCents: 4990,
    stock: 15,
    minStock: 5,
  },
]

function cloneProducts() {
  return initialProducts.map((product) => ({ ...product }))
}

export const products: Product[] = cloneProducts()

let productsVersion = 0
const productListeners = new Set<() => void>()

function emitProductsChanged() {
  productsVersion += 1
  productListeners.forEach((listener) => listener())
}

export function getProductsVersion() {
  return productsVersion
}

export function subscribeProducts(listener: () => void) {
  productListeners.add(listener)
  return () => productListeners.delete(listener)
}

export function restockProduct(productId: string, quantity: number) {
  if (!Number.isInteger(quantity) || quantity <= 0) {
    throw new Error(
      "A quantidade recebida deve ser um número inteiro positivo.",
    )
  }

  const product = products.find((candidate) => candidate.id === productId)

  if (!product) {
    throw new Error("Produto não encontrado.")
  }

  product.stock += quantity
  emitProductsChanged()
  return product
}

export function decreaseProductStock(productId: string, quantity: number) {
  const product = products.find((candidate) => candidate.id === productId)

  if (!product || quantity <= 0 || quantity > product.stock) {
    throw new Error("Não foi possível baixar o estoque do produto.")
  }

  product.stock -= quantity
  emitProductsChanged()
  return product
}

export function resetProductsForTests() {
  products.splice(0, products.length, ...cloneProducts())
  emitProductsChanged()
}
