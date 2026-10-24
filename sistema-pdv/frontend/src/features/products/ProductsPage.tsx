import { useCallback, useEffect, useMemo, useState } from "react"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import PageHeader from "../../components/ui/PageHeader"
import { formatMoney } from "../../domain/formatters"
import { ApiError } from "../../services/api"
import RestockProductDialog from "../dashboard/components/RestockProductDialog"
import {
  archiveProduct,
  createProduct,
  fetchArchivedProducts,
  fetchProductResponses,
  reactivateProduct,
  restockProduct,
  toProduct,
  updateProduct,
  type ProductFormData,
  type ProductResponse,
} from "../../services/products"
import ArchiveProductDialog from "./components/ArchiveProductDialog"
import ImportProductsDialog from "./components/ImportProductsDialog"
import ProductFormDialog from "./components/ProductFormDialog"
import ProductHistoryDialog from "./components/ProductHistoryDialog"

/** Qual diálogo está aberto e para qual produto. Só um por vez. */
type OpenDialog =
  | { type: "NONE" }
  | { type: "FORM"; product: ProductResponse | null; notice?: string }
  | { type: "RESTOCK"; product: ProductResponse }
  | { type: "HISTORY"; product: ProductResponse }
  | { type: "ARCHIVE"; product: ProductResponse }
  | { type: "IMPORT" }

/** Ativos aparecem no PDV; arquivados ficam guardados e podem voltar. */
type View = "ACTIVE" | "ARCHIVED"

/** Cadastro de produtos (só ADMIN). Cada ação chama a API e depois recarrega a lista. */
export default function ProductsPage() {
  const [products, setProducts] = useState<ProductResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<OpenDialog>({ type: "NONE" })
  const [notice, setNotice] = useState("")
  const [view, setView] = useState<View>("ACTIVE")
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)

  /** Busca a lista e devolve o resultado (para quem precisa do produto atualizado). */
  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      const result =
        view === "ACTIVE"
          ? await fetchProductResponses()
          : await fetchArchivedProducts()
      setProducts(result)
      return result
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Não foi possível carregar.",
      )
      return null
    } finally {
      setLoading(false)
    }
  }, [view])

  useEffect(() => {
    void reload()
  }, [reload])

  function changeView(next: View) {
    if (next === view) return
    setProducts([])
    setNotice("")
    setView(next)
  }

  async function reactivate(product: ProductResponse) {
    setReactivatingId(product.id)
    setNotice("")
    try {
      await reactivateProduct(product.id)
      await reload()
      setNotice(`${product.name} reativado: já aparece no PDV.`)
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Não foi possível reativar.",
      )
    } finally {
      setReactivatingId(null)
    }
  }

  // Filtra por nome ou código enquanto digita (a lista já está toda em memória).
  const visibleProducts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase("pt-BR")
    if (!query) return products
    return products.filter(
      (product) =>
        product.barcode.toLocaleLowerCase("pt-BR").includes(query) ||
        product.name.toLocaleLowerCase("pt-BR").includes(query),
    )
  }, [products, search])

  const closeDialog = useCallback(() => setDialog({ type: "NONE" }), [])

  /** Depois de qualquer mudança: fecha o diálogo, busca a lista de novo e avisa. */
  async function finish(message: string) {
    closeDialog()
    await reload()
    setNotice(message)
  }

  async function saveProduct(data: ProductFormData) {
    if (dialog.type !== "FORM") return

    if (dialog.product === null) {
      const created = await createProduct(data)
      await finish(`${created.name} cadastrado.`)
      return
    }

    try {
      const updated = await updateProduct(
        dialog.product.id,
        {
          name: data.name,
          priceInCents: data.priceInCents,
          minStock: data.minStock,
        },
        dialog.product.version,
      )
      await finish(`${updated.name} atualizado.`)
    } catch (err) {
      if (!(err instanceof ApiError && err.status === 409)) throw err

      // Outra pessoa alterou antes. Em vez de sobrescrever a mudança dela, reabre o
      // formulário com os dados novos (e a version nova) para a pessoa conferir.
      const fresh = (await reload())?.find(
        (candidate) => candidate.id === dialog.product?.id,
      )
      if (!fresh) throw err
      setDialog({
        type: "FORM",
        product: fresh,
        notice:
          "Outra pessoa alterou este produto. Os campos mostram os dados atuais: confira e salve de novo.",
      })
    }
  }

  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          actions={
            <>
              <Button onClick={() => setDialog({ type: "IMPORT" })}>
                Importar CSV
              </Button>
              <Button
                onClick={() => setDialog({ type: "FORM", product: null })}
                variant="primary"
              >
                Novo produto
              </Button>
            </>
          }
          description="Cadastre os produtos vendidos no PDV, ajuste preços e acompanhe o estoque."
          title="Produtos"
        />

        <div
          aria-label="Quais produtos mostrar"
          className="mt-6 inline-flex rounded-lg border border-neutral-300 bg-white p-1"
          role="tablist"
        >
          {(
            [
              ["ACTIVE", "Ativos"],
              ["ARCHIVED", "Arquivados"],
            ] as const
          ).map(([value, label]) => (
            <button
              aria-selected={view === value}
              className={`min-h-9 rounded-md px-4 text-sm font-semibold ${
                view === value
                  ? "bg-neutral-900 text-white"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
              key={value}
              onClick={() => changeView(value)}
              role="tab"
              type="button"
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <input
            aria-label="Buscar produto"
            className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100 sm:max-w-sm"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome ou código"
            value={search}
          />
          <p className="text-sm text-neutral-500">
            {products.length} produto{products.length === 1 ? "" : "s"}{" "}
            {view === "ACTIVE" ? "ativo" : "arquivado"}
            {products.length === 1 ? "" : "s"}
          </p>
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
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Código</th>
                <th className="px-4 py-3 font-medium">Produto</th>
                <th className="px-4 py-3 text-right font-medium">Preço</th>
                <th className="px-4 py-3 text-right font-medium">Estoque</th>
                <th className="px-4 py-3 text-right font-medium">Mínimo</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {visibleProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                    {product.barcode}
                  </td>
                  <td className="px-4 py-3 font-medium text-neutral-900">
                    {product.name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatMoney(product.priceInCents)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.belowMinStock ? (
                      <Badge variant="warning">{product.stockQuantity}</Badge>
                    ) : (
                      <span className="font-mono">{product.stockQuantity}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-neutral-600">
                    {product.minStock}
                  </td>
                  <td className="px-4 py-3">
                    {view === "ARCHIVED" ? (
                      <div className="flex justify-end gap-1.5">
                        <ActionButton
                          onClick={() =>
                            setDialog({ type: "HISTORY", product })
                          }
                        >
                          Histórico
                        </ActionButton>
                        <ActionButton
                          disabled={reactivatingId !== null}
                          onClick={() => void reactivate(product)}
                        >
                          {reactivatingId === product.id
                            ? "Reativando..."
                            : "Reativar"}
                        </ActionButton>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1.5">
                        <ActionButton
                          onClick={() => setDialog({ type: "FORM", product })}
                        >
                          Editar
                        </ActionButton>
                        <ActionButton
                          onClick={() =>
                            setDialog({ type: "RESTOCK", product })
                          }
                        >
                          Repor
                        </ActionButton>
                        <ActionButton
                          onClick={() =>
                            setDialog({ type: "HISTORY", product })
                          }
                        >
                          Histórico
                        </ActionButton>
                        <ActionButton
                          danger
                          onClick={() =>
                            setDialog({ type: "ARCHIVE", product })
                          }
                        >
                          Arquivar
                        </ActionButton>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <TableStatus
            archived={view === "ARCHIVED"}
            error={loadError}
            hasProducts={products.length > 0}
            hasResults={visibleProducts.length > 0}
            loading={loading}
            onRetry={() => void reload()}
          />
        </Card>
      </div>

      {dialog.type === "FORM" ? (
        <ProductFormDialog
          // Nova key = formulário novo, já preenchido (inclusive depois de um conflito).
          key={`${dialog.product?.id ?? "novo"}-${dialog.product?.version ?? 0}`}
          notice={dialog.notice}
          onClose={closeDialog}
          onSave={saveProduct}
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

      <ImportProductsDialog
        onClose={closeDialog}
        onImported={(created, withInitialStock) => {
          void finish(
            `${created} produto${created === 1 ? "" : "s"} importado${created === 1 ? "" : "s"}` +
              (withInitialStock > 0
                ? `, ${withInitialStock} com estoque inicial.`
                : "."),
          )
        }}
        open={dialog.type === "IMPORT"}
      />

      <ArchiveProductDialog
        onClose={closeDialog}
        onConfirm={async () => {
          if (dialog.type !== "ARCHIVE") return
          await archiveProduct(dialog.product.id)
          await finish(`${dialog.product.name} arquivado.`)
        }}
        product={dialog.type === "ARCHIVE" ? dialog.product : null}
      />
    </main>
  )
}

function ActionButton({
  danger = false,
  ...props
}: { danger?: boolean } & Parameters<typeof Button>[0]) {
  return (
    <Button
      className="min-h-9 px-3 text-xs"
      variant={danger ? "danger" : "secondary"}
      {...props}
    />
  )
}

interface TableStatusProps {
  archived: boolean
  loading: boolean
  error: string
  hasProducts: boolean
  hasResults: boolean
  onRetry: () => void
}

/** A mensagem embaixo da tabela: carregando, erro, nada cadastrado ou nada encontrado. */
function TableStatus({
  archived,
  loading,
  error,
  hasProducts,
  hasResults,
  onRetry,
}: TableStatusProps) {
  if (error) {
    return (
      <p className="px-4 py-8 text-center text-sm text-red-700" role="alert">
        Não foi possível carregar os produtos: {error}{" "}
        <button
          className="font-semibold underline"
          onClick={onRetry}
          type="button"
        >
          Tentar de novo
        </button>
      </p>
    )
  }
  if (loading && !hasProducts) {
    return (
      <p className="px-4 py-8 text-center text-sm text-neutral-500">
        Carregando produtos...
      </p>
    )
  }
  if (!hasProducts && archived) {
    return (
      <p className="px-4 py-8 text-center text-sm text-neutral-500">
        Nenhum produto arquivado.
      </p>
    )
  }
  if (!hasProducts) {
    return (
      <p className="px-4 py-8 text-center text-sm text-neutral-500">
        Nenhum produto cadastrado. Clique em “Novo produto” para começar.
      </p>
    )
  }
  if (!hasResults) {
    return (
      <p className="px-4 py-8 text-center text-sm text-neutral-500">
        Nenhum produto encontrado para essa busca.
      </p>
    )
  }
  return null
}
