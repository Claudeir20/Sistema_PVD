import { useCallback, useEffect, useMemo, useState } from "react"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import MetricCard from "../../components/ui/MetricCard"
import PageHeader from "../../components/ui/PageHeader"
import { formatMoney } from "../../domain/formatters"
import {
  adjustProductStock,
  fetchProductResponses,
  restockProduct,
  toProduct,
  type ProductResponse,
} from "../../services/products"
import RestockProductDialog from "../dashboard/components/RestockProductDialog"
import ProductHistoryDialog from "../products/components/ProductHistoryDialog"
import AdjustStockDialog from "./components/AdjustStockDialog"

type StockFilter = "ALL" | "LOW" | "EMPTY"

const filters: { value: StockFilter; label: string }[] = [
  { value: "ALL", label: "Todos" },
  { value: "LOW", label: "Abaixo do mínimo" },
  { value: "EMPTY", label: "Sem estoque" },
]

function matchesFilter(product: ProductResponse, filter: StockFilter) {
  if (filter === "LOW") return product.belowMinStock
  if (filter === "EMPTY") return product.stockQuantity === 0
  return true
}

type OpenDialog =
  | { type: "NONE" }
  | { type: "ADJUST"; product: ProductResponse }
  | { type: "RESTOCK"; product: ProductResponse }
  | { type: "HISTORY"; product: ProductResponse }

/** Visão do estoque (só ADMIN): o que está acabando, reposição e ajuste por contagem. */
export default function StockPage() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [filter, setFilter] = useState<StockFilter>("ALL")
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<OpenDialog>({ type: "NONE" })
  const [notice, setNotice] = useState("")

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      setProducts(await fetchProductResponses())
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Não foi possível carregar.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const closeDialog = useCallback(() => setDialog({ type: "NONE" }), [])

  async function finish(message: string) {
    closeDialog()
    await reload()
    setNotice(message)
  }

  const summary = useMemo(
    () => ({
      units: products.reduce((total, p) => total + p.stockQuantity, 0),
      low: products.filter((p) => matchesFilter(p, "LOW")).length,
      empty: products.filter((p) => matchesFilter(p, "EMPTY")).length,
      // Preço de venda × quantidade: quanto o estoque vale se tudo for vendido.
      valueInCents: products.reduce(
        (total, p) => total + p.priceInCents * p.stockQuantity,
        0,
      ),
    }),
    [products],
  )

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR")
    return (
      products
        .filter((product) => matchesFilter(product, filter))
        .filter(
          (product) =>
            !query ||
            product.barcode.includes(query) ||
            product.name.toLocaleLowerCase("pt-BR").includes(query),
        )
        // Quem mais precisa de atenção primeiro: menor estoque em relação ao mínimo.
        .sort(
          (a, b) =>
            a.stockQuantity - a.minStock - (b.stockQuantity - b.minStock) ||
            a.name.localeCompare(b.name, "pt-BR"),
        )
    )
  }, [products, filter, search])

  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          description="Acompanhe o que está acabando, registre entradas e corrija o estoque depois de uma contagem."
          title="Estoque"
        />

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            helper={`${products.length} produto${products.length === 1 ? "" : "s"} ativo${products.length === 1 ? "" : "s"}`}
            label="Unidades em estoque"
            value={summary.units}
          />
          <MetricCard label="Abaixo do mínimo" value={summary.low} />
          <MetricCard label="Sem estoque" value={summary.empty} />
          <MetricCard
            helper="pelo preço de venda"
            label="Valor em estoque"
            value={formatMoney(summary.valueInCents)}
          />
        </section>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div
            aria-label="Filtrar estoque"
            className="inline-flex rounded-lg border border-neutral-300 bg-white p-1"
            role="group"
          >
            {filters.map((option) => (
              <button
                aria-pressed={filter === option.value}
                className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                  filter === option.value
                    ? "bg-neutral-900 text-white"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
                key={option.value}
                onClick={() => setFilter(option.value)}
                type="button"
              >
                {option.label}
              </button>
            ))}
          </div>
          <input
            aria-label="Buscar produto"
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 lg:max-w-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou código"
            value={search}
          />
        </div>

        {notice ? (
          <p
            className="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 text-right font-medium">Estoque</th>
                <th className="px-4 py-3 text-right font-medium">Mínimo</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-neutral-900">
                      {product.name}
                    </p>
                    <p className="font-mono text-xs text-neutral-500">
                      {product.barcode}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-semibold">
                    {product.stockQuantity}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-600">
                    {product.minStock}
                  </td>
                  <td className="px-4 py-3">
                    <StockBadge product={product} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1.5">
                      <ActionButton
                        onClick={() => setDialog({ type: "RESTOCK", product })}
                      >
                        Repor
                      </ActionButton>
                      <ActionButton
                        onClick={() => setDialog({ type: "ADJUST", product })}
                      >
                        Ajustar
                      </ActionButton>
                      <ActionButton
                        onClick={() => setDialog({ type: "HISTORY", product })}
                      >
                        Histórico
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {loadError ? (
            <p
              className="px-4 py-8 text-center text-sm text-red-700"
              role="alert"
            >
              Não foi possível carregar o estoque: {loadError}{" "}
              <button
                className="font-semibold underline"
                onClick={() => void reload()}
                type="button"
              >
                Tentar de novo
              </button>
            </p>
          ) : loading && products.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">
              Carregando estoque...
            </p>
          ) : visibleProducts.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">
              {products.length === 0
                ? "Nenhum produto cadastrado. Cadastre em Produtos."
                : "Nenhum produto neste filtro."}
            </p>
          ) : null}
        </Card>
      </div>

      {dialog.type === "ADJUST" ? (
        <AdjustStockDialog
          key={dialog.product.id}
          onClose={closeDialog}
          onSave={async (countedQuantity, reason) => {
            const before = dialog.product.stockQuantity
            await adjustProductStock(dialog.product.id, countedQuantity, reason)
            await finish(
              `${dialog.product.name}: estoque ajustado de ${before} para ${countedQuantity}.`,
            )
          }}
          product={dialog.product}
        />
      ) : null}

      <RestockProductDialog
        onClose={closeDialog}
        onConfirm={async (quantity) => {
          if (dialog.type !== "RESTOCK") return
          await restockProduct(dialog.product.id, quantity)
          await finish(`Entrada de ${quantity} em ${dialog.product.name}.`)
        }}
        product={dialog.type === "RESTOCK" ? toProduct(dialog.product) : null}
      />

      <ProductHistoryDialog
        onClose={closeDialog}
        product={dialog.type === "HISTORY" ? dialog.product : null}
      />
    </main>
  )
}

/** Mesma regra do backend: no mínimo (ou abaixo) já pede reposição. */
function StockBadge({ product }: { product: ProductResponse }) {
  if (product.stockQuantity === 0)
    return <Badge variant="danger">Sem estoque</Badge>
  if (product.belowMinStock) return <Badge variant="warning">Repor</Badge>
  return <Badge variant="success">Ok</Badge>
}

function ActionButton(props: Parameters<typeof Button>[0]) {
  return <Button className="min-h-9 px-3 text-xs" {...props} />
}
