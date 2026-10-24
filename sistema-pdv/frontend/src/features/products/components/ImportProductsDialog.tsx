import { useState, type ChangeEvent } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import { formatMoney } from "../../../domain/formatters"
import { importProducts, ImportRejectedError } from "../../../services/products"
import {
  CSV_TEMPLATE,
  decodeCsvBytes,
  parseProductsCsv,
  type CsvRow,
} from "../productCsv"

interface ImportProductsDialogProps {
  open: boolean
  onClose: () => void
  onImported: (created: number, withInitialStock: number) => void
}

/**
 * Importa produtos de um CSV: lê o arquivo aqui, mostra a prévia com o erro de
 * cada linha e só envia quando tudo está certo. O backend grava tudo ou nada.
 */
export default function ImportProductsDialog({
  open,
  onClose,
  onImported,
}: ImportProductsDialogProps) {
  const [fileName, setFileName] = useState("")
  const [rows, setRows] = useState<CsvRow[]>([])
  const [error, setError] = useState("")
  const [importing, setImporting] = useState(false)

  const validCount = rows.filter((row) => row.error === null).length
  const errorCount = rows.length - validCount

  async function readFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Limpa o campo: escolher o mesmo arquivo de novo (depois de corrigir) relê.
    event.target.value = ""
    if (!file) return

    setFileName(file.name)
    setError("")
    const result = parseProductsCsv(decodeCsvBytes(await file.arrayBuffer()))
    setRows(result.rows)
    if (result.fileError) setError(result.fileError)
  }

  async function confirmImport() {
    const items = rows.flatMap((row) => (row.item ? [row.item] : []))
    setImporting(true)
    setError("")
    try {
      const result = await importProducts(items)
      onImported(result.created, result.withInitialStock)
    } catch (err) {
      if (err instanceof ImportRejectedError) {
        // Marca na prévia as linhas que o backend recusou (ex.: já cadastrado).
        const byLine = new Map(err.errors.map((e) => [e.line, e.message]))
        setRows((current) =>
          current.map((row) => {
            const message = byLine.get(row.line)
            if (!message || !row.item) return row
            return {
              line: row.line,
              item: null,
              error: message,
              barcode: row.item.barcode,
              name: row.item.name,
            }
          }),
        )
      }
      setError(
        err instanceof Error ? err.message : "Não foi possível importar.",
      )
    } finally {
      setImporting(false)
    }
  }

  function close() {
    setFileName("")
    setRows([])
    setError("")
    onClose()
  }

  return (
    <Dialog
      onClose={importing ? () => {} : close}
      open={open}
      size="lg"
      title="Importar produtos"
    >
      <p className="text-sm leading-6 text-neutral-600">
        Use uma planilha com as colunas{" "}
        <strong>codigo, nome, preco, estoque_minimo e estoque_inicial</strong>{" "}
        (as duas últimas podem ficar vazias). No Excel, salve como{" "}
        <em>CSV (separado por ponto e vírgula)</em>.{" "}
        <button
          className="font-semibold text-[#2f5fcb] underline"
          onClick={downloadTemplate}
          type="button"
        >
          Baixar modelo
        </button>
      </p>

      <label className="mt-4 flex min-h-12 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50 px-4 text-sm font-semibold text-neutral-700 hover:border-[#2f5fcb] hover:text-[#2f5fcb]">
        {fileName ? `Trocar arquivo (${fileName})` : "Escolher arquivo CSV"}
        <input
          accept=".csv,text/csv"
          className="sr-only"
          disabled={importing}
          onChange={(event) => void readFile(event)}
          type="file"
        />
      </label>

      {rows.length > 0 ? (
        <>
          <p className="mt-4 text-sm text-neutral-700">
            <strong>{validCount}</strong> pronto{validCount === 1 ? "" : "s"}
            {errorCount > 0 ? (
              <>
                {" · "}
                <strong className="text-red-700">
                  {errorCount} com erro
                </strong>{" "}
                (corrija no arquivo e escolha de novo)
              </>
            ) : null}
          </p>
          <div className="mt-2 max-h-72 overflow-auto rounded-lg border border-neutral-200">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="sticky top-0 bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500">
                <tr>
                  <th className="px-3 py-2 font-medium">Linha</th>
                  <th className="px-3 py-2 font-medium">Código</th>
                  <th className="px-3 py-2 font-medium">Produto</th>
                  <th className="px-3 py-2 text-right font-medium">Preço</th>
                  <th className="px-3 py-2 text-right font-medium">Mín.</th>
                  <th className="px-3 py-2 text-right font-medium">Estoque</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {rows.map((row) => (
                  <PreviewRow key={row.line} row={row} />
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : null}

      {error ? (
        <p className="mt-3 text-sm font-semibold text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button disabled={importing} onClick={close}>
          Cancelar
        </Button>
        <Button
          disabled={importing || validCount === 0 || errorCount > 0}
          onClick={() => void confirmImport()}
          variant="primary"
        >
          {importing
            ? "Importando..."
            : `Importar ${validCount} produto${validCount === 1 ? "" : "s"}`}
        </Button>
      </div>
    </Dialog>
  )
}

function PreviewRow({ row }: { row: CsvRow }) {
  if (row.error !== null) {
    return (
      <tr className="bg-red-50 text-red-900">
        <td className="px-3 py-2 font-mono">{row.line}</td>
        <td className="px-3 py-2 font-mono">{row.barcode || "—"}</td>
        <td className="px-3 py-2" colSpan={4}>
          <span className="font-medium">{row.name || "—"}</span>
          <span className="block font-semibold">{row.error}</span>
        </td>
      </tr>
    )
  }
  const { item } = row
  return (
    <tr>
      <td className="px-3 py-2 font-mono text-neutral-500">{row.line}</td>
      <td className="px-3 py-2 font-mono">{item.barcode}</td>
      <td className="px-3 py-2 text-neutral-900">{item.name}</td>
      <td className="px-3 py-2 text-right font-mono">
        {formatMoney(item.priceInCents)}
      </td>
      <td className="px-3 py-2 text-right font-mono">{item.minStock}</td>
      <td className="px-3 py-2 text-right font-mono">
        {item.initialStock ?? 0}
      </td>
    </tr>
  )
}

/** O BOM faz o Excel abrir o modelo com os acentos certos. */
function downloadTemplate() {
  const blob = new Blob(["﻿" + CSV_TEMPLATE], {
    type: "text/csv;charset=utf-8",
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "modelo-produtos.csv"
  link.click()
  URL.revokeObjectURL(url)
}
