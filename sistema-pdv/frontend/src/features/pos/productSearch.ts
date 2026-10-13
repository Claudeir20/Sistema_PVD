import type { Product } from "../../domain/types"

export type ProductSearchResult =
  | { type: "EMPTY" }
  | { type: "DIRECT"; product: Product }
  | { type: "MULTIPLE"; products: Product[] }

export function searchProducts(
  catalog: readonly Product[],
  query: string,
): ProductSearchResult {
  const normalizedQuery = query.trim().toLocaleLowerCase("pt-BR")

  if (!normalizedQuery) return { type: "EMPTY" }

  const barcodeMatch = catalog.find(
    (product) => product.barcode === normalizedQuery,
  )

  if (barcodeMatch) {
    return { type: "DIRECT", product: barcodeMatch }
  }

  const nameMatches = catalog.filter((product) =>
    product.name.toLocaleLowerCase("pt-BR").includes(normalizedQuery),
  )

  if (nameMatches.length === 1) {
    return { type: "DIRECT", product: nameMatches[0] }
  }

  if (nameMatches.length > 1) {
    return { type: "MULTIPLE", products: nameMatches }
  }

  return { type: "EMPTY" }
}

export function moveProductSelection(
  currentIndex: number,
  direction: "NEXT" | "PREVIOUS",
  total: number,
) {
  if (total <= 0) return -1

  if (direction === "NEXT") {
    return (currentIndex + 1 + total) % total
  }

  return (currentIndex - 1 + total) % total
}
