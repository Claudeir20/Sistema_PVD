import { useState } from "react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import type { Product } from "../../../domain/types"
import { restockProduct } from "../../../services/products"
import RestockProductDialog from "./RestockProductDialog"

interface LowStockListProps {
  products: readonly Product[]
}

export default function LowStockList({ products }: LowStockListProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const lowStockProducts = products.filter(
    (product) => product.stock < product.minStock,
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
        onConfirm={(quantity) => {
          if (!selectedProduct) return
          restockProduct(selectedProduct.id, quantity)
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
