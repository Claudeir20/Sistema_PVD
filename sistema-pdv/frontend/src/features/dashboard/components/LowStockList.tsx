import { useState } from "react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import type { Product } from "../../../domain/types"
import { restockProduct, type ProductsStatus } from "../../../services/products"
import RestockProductDialog from "./RestockProductDialog"

interface LowStockListProps {
  products: readonly Product[]
  status: ProductsStatus
  error: string
  onRetry: () => void
}

export default function LowStockList({
  products,
  status,
  error,
  onRetry,
}: LowStockListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  // Mesma regra do backend (Product.isBelowMinStock): no mínimo já pede reposição.
  const lowStockProducts = products.filter(
    (product) => product.stock <= product.minStock,
  )

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-neutral-200 px-4 py-4">
        <div>
          <h2 className="font-bold text-neutral-900">
            Estoque abaixo do mínimo
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Itens que precisam de reposição
          </p>
        </div>
        <BadgeCount count={lowStockProducts.length} />
      </div>

      {status === "LOADING" && products.length === 0 ? (
        <p className="px-4 py-6 text-sm text-neutral-500">
          Carregando produtos...
        </p>
      ) : null}
      {status === "ERROR" ? (
        <p className="px-4 py-6 text-sm text-red-700" role="alert">
          Não foi possível carregar os produtos: {error}{" "}
          <button
            className="font-semibold underline"
            onClick={onRetry}
            type="button"
          >
            Tentar de novo
          </button>
        </p>
      ) : null}
      {status === "READY" && lowStockProducts.length === 0 ? (
        <p className="px-4 py-6 text-sm text-neutral-500">
          Nenhum produto abaixo do mínimo.
        </p>
      ) : null}

      <div className="divide-y divide-neutral-200">
        {lowStockProducts.map((product) => {
          return (
            <div className="flex items-center gap-4 px-4 py-3" key={product.id}>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-800">
                  {product.name}
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Atual {product.stock} · mínimo {product.minStock}
                </p>
              </div>
              <Button
                className="min-h-9 px-3 text-xs"
                onClick={() => setSelectedProduct(product)}
              >
                Repor
              </Button>
            </div>
          )
        })}
      </div>
      <RestockProductDialog
        onClose={() => setSelectedProduct(null)}
        onConfirm={async (quantity) => {
          if (!selectedProduct) return
          // Se a API recusar, o erro sobe para o diálogo, que continua aberto.
          await restockProduct(selectedProduct.id, quantity)
          setSelectedProduct(null)
        }}
        product={selectedProduct}
      />
    </Card>
  )
}

function BadgeCount({ count }: { count: number }) {
  return (
    <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-bold text-amber-800">
      {count}
    </span>
  )
}
