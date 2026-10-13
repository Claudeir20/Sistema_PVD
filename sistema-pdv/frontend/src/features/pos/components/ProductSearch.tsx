import { useState, type RefObject } from "react"
import { formatMoney } from "../../../domain/formatters"
import type { Product } from "../../../domain/types"
import { products } from "../../../services/products"
import { moveProductSelection, searchProducts } from "../productSearch"

interface ProductSearchProps {
  disabled?: boolean
  inputRef: RefObject<HTMLInputElement | null>
  quantity: number
  onQuantityChange: (quantity: number) => void
  onAddProduct: (product: Product) => string | null
}

export default function ProductSearch({
  disabled = false,
  inputRef,
  quantity,
  onQuantityChange,
  onAddProduct,
}: ProductSearchProps) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [matches, setMatches] = useState<Product[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)

  function chooseProduct(product: Product) {
    const addError = onAddProduct(product)

    if (addError) {
      setError(addError)
      inputRef.current?.focus()
      return
    }

    setQuery("")
    setError("")
    setMatches([])
    setSelectedIndex(0)
  }

  function submitSearch() {
    if (disabled) return

    const result = searchProducts(products, query)

    if (result.type === "EMPTY") {
      setError("Produto não encontrado.")
      setMatches([])
      inputRef.current?.focus()
      return
    }

    if (result.type === "DIRECT") {
      chooseProduct(result.product)
      return
    }

    setMatches(result.products)
    chooseProduct(result.products[selectedIndex] ?? result.products[0])
  }

  function updateQuery(value: string) {
    setQuery(value)
    setError("")
    setSelectedIndex(0)

    const result = searchProducts(products, value)
    setMatches(result.type === "MULTIPLE" ? result.products : [])
  }

  return (
    <div>
      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_110px]">
        <div className="relative">
          <label
            className="mb-1.5 block text-xs font-medium text-neutral-600"
            htmlFor="pos-product-search"
          >
            Código de barras ou nome do produto (F2)
          </label>
          <input
            autoFocus
            className="h-[52px] w-full rounded-lg border-2 border-neutral-900 bg-white px-4 font-mono text-base outline-none transition-shadow placeholder:text-neutral-400 focus:ring-4 focus:ring-blue-100"
            disabled={disabled}
            id="pos-product-search"
            onChange={(event) => updateQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown" && matches.length > 0) {
                event.preventDefault()
                setSelectedIndex((current) =>
                  moveProductSelection(current, "NEXT", matches.length),
                )
                return
              }

              if (event.key === "ArrowUp" && matches.length > 0) {
                event.preventDefault()
                setSelectedIndex((current) =>
                  moveProductSelection(current, "PREVIOUS", matches.length),
                )
                return
              }

              if (event.key === "Enter") {
                event.preventDefault()
                submitSearch()
              }
            }}
            placeholder="Bipe o produto ou digite para buscar..."
            ref={inputRef}
            value={query}
          />
          {matches.length > 1 ? (
            <ul className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-xl">
              {matches.map((product, index) => (
                <li key={product.id}>
                  <button
                    className={`flex w-full items-center justify-between gap-4 px-4 py-3 text-left text-sm ${
                      selectedIndex === index
                        ? "bg-blue-50 text-blue-900"
                        : "text-neutral-800 hover:bg-neutral-50"
                    }`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => chooseProduct(product)}
                    type="button"
                  >
                    <span>
                      <span className="block font-medium">{product.name}</span>
                      <span className="mt-0.5 block text-xs text-neutral-500">
                        Estoque: {product.stock}
                      </span>
                    </span>
                    <span className="shrink-0 font-mono">
                      {formatMoney(product.priceInCents)}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-neutral-600">
            Qtd.
          </span>
          <input
            className="h-[52px] w-full rounded-lg border border-neutral-300 bg-white px-4 text-base outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"
            disabled={disabled}
            min={1}
            onChange={(event) =>
              onQuantityChange(Math.max(1, Number(event.target.value) || 1))
            }
            type="number"
            value={quantity}
          />
        </label>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
