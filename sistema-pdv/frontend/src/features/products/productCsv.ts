import { parseMoneyToCents } from "../../domain/formatters"
import type { ImportProductItem } from "../../services/products"

export const MAX_IMPORT_ROWS = 1000

/** O modelo que o admin baixa: o formato do Excel em português (";" e vírgula decimal). */
export const CSV_TEMPLATE =
  "codigo;nome;preco;estoque_minimo;estoque_inicial\r\n" +
  "7891000000011;Cabo USB-C;29,90;5;20\r\n" +
  "CAP20;Capinha iPhone 13;20,00;2;10\r\n"

/** Uma linha do arquivo na prévia: pronta para importar ou com o motivo do erro. */
export type CsvRow =
  | { line: number; item: ImportProductItem; error: null }
  | { line: number; item: null; error: string; barcode: string; name: string }

export interface CsvParseResult {
  rows: CsvRow[]
  /** Erro do arquivo inteiro (sem cabeçalho, sem a coluna nome...): nada para mostrar. */
  fileError: string | null
}

type Column = "barcode" | "name" | "price" | "minStock" | "initialStock"

/** Nomes aceitos no cabeçalho, sem acento e em minúsculas. */
const HEADER_NAMES: Record<string, Column> = {
  codigo: "barcode",
  codigo_de_barras: "barcode",
  barcode: "barcode",
  nome: "name",
  produto: "name",
  preco: "price",
  estoque_minimo: "minStock",
  minimo: "minStock",
  estoque_inicial: "initialStock",
  estoque: "initialStock",
  quantidade: "initialStock",
}

/**
 * Excel em português costuma salvar em Windows-1252; os outros, em UTF-8.
 * Tenta UTF-8 e, se os bytes não forem UTF-8 válido, lê como Windows-1252.
 */
export function decodeCsvBytes(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes)
  } catch {
    return new TextDecoder("windows-1252").decode(bytes)
  }
}

/** Lê o arquivo e confere cada linha com as mesmas regras do cadastro. */
export function parseProductsCsv(text: string): CsvParseResult {
  const records = splitRecords(text.replace(/^﻿/, ""))
  const firstIndex = records.findIndex((record) => !isBlank(record.fields))
  if (firstIndex < 0) return { rows: [], fileError: "O arquivo está vazio." }

  const header = records[firstIndex]
  const columns = header.fields.map(
    (name) => HEADER_NAMES[normalizeHeader(name)],
  )
  const missing = (["barcode", "name", "price"] as Column[]).filter(
    (column) => !columns.includes(column),
  )
  if (missing.length > 0) {
    return {
      rows: [],
      fileError:
        "O cabeçalho precisa ter as colunas codigo, nome e preco. Baixe o modelo para ver o formato.",
    }
  }

  const dataRecords = records
    .slice(firstIndex + 1)
    .filter((record) => !isBlank(record.fields))
  if (dataRecords.length === 0) {
    return { rows: [], fileError: "O arquivo não tem produtos." }
  }
  if (dataRecords.length > MAX_IMPORT_ROWS) {
    return {
      rows: [],
      fileError: `Importe no máximo ${MAX_IMPORT_ROWS} produtos por vez (o arquivo tem ${dataRecords.length}).`,
    }
  }

  const seen = new Set<string>()
  const rows = dataRecords.map((record): CsvRow => {
    const value = (column: Column) => {
      const index = columns.indexOf(column)
      return index < 0 ? "" : (record.fields[index] ?? "").trim()
    }
    const failed = (error: string): CsvRow => ({
      line: record.line,
      item: null,
      error,
      barcode: value("barcode"),
      name: value("name"),
    })
    const result = toItem(record.line, value)
    if (result.error !== null) return failed(result.error)
    if (seen.has(result.item.barcode)) {
      return failed(`Código ${result.item.barcode} repetido no arquivo.`)
    }
    seen.add(result.item.barcode)
    return { line: record.line, item: result.item, error: null }
  })

  return { rows, fileError: null }
}

function toItem(
  line: number,
  value: (column: Column) => string,
): { item: ImportProductItem; error: null } | { item: null; error: string } {
  const fail = (error: string) => ({ item: null, error })

  const barcode = value("barcode")
  if (!barcode) return fail("Informe o código de barras.")
  if (barcode.length > 50) {
    return fail("O código de barras deve ter no máximo 50 caracteres.")
  }

  const name = value("name")
  if (!name) return fail("Informe o nome do produto.")
  if (name.length > 120) {
    return fail("O nome do produto deve ter no máximo 120 caracteres.")
  }

  if (!value("price")) return fail("Informe o preço.")
  const priceInCents = parseMoneyToCents(value("price"))
  if (priceInCents === null)
    return fail("Preço inválido. Use, por exemplo, 29,90.")
  if (priceInCents <= 0) return fail("O preço deve ser maior que zero.")

  const minStock = parseQuantity(value("minStock"))
  if (minStock === undefined) {
    return fail("O estoque mínimo deve ser um número inteiro (0 ou mais).")
  }

  const initialStock = parseQuantity(value("initialStock"))
  if (initialStock === undefined) {
    return fail("O estoque inicial deve ser um número inteiro (0 ou mais).")
  }

  return {
    item: {
      line,
      barcode,
      name,
      priceInCents,
      minStock: minStock ?? 0,
      initialStock,
    },
    error: null,
  }
}

/** Vazio → null; inteiro ≥ 0 → número; qualquer outra coisa → undefined (erro). */
function parseQuantity(text: string): number | null | undefined {
  if (!text) return null
  return /^\d+$/.test(text) ? Number(text) : undefined
}

function normalizeHeader(name: string) {
  return name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[\s-]+/g, "_")
}

function isBlank(fields: string[]) {
  return fields.every((field) => field.trim() === "")
}

/**
 * Divide o texto em registros, respeitando aspas ("a;b" é um campo só, "" é uma aspa).
 * O separador é o que mais aparece na primeira linha: ";" (Excel em português) ou ",".
 * Cada registro guarda a linha em que começa no arquivo.
 */
function splitRecords(text: string) {
  const firstLine = text.split(/\r?\n/, 1)[0] ?? ""
  const delimiter = count(firstLine, ";") >= count(firstLine, ",") ? ";" : ","

  const records: { line: number; fields: string[] }[] = []
  let fields: string[] = []
  let field = ""
  let inQuotes = false
  let line = 1
  let recordLine = 1

  for (let i = 0; i < text.length; i++) {
    const char = text[i]
    if (inQuotes) {
      if (char === '"' && text[i + 1] === '"') {
        field += '"'
        i++
      } else if (char === '"') {
        inQuotes = false
      } else {
        if (char === "\n") line++
        field += char
      }
    } else if (char === '"') {
      inQuotes = true
    } else if (char === delimiter) {
      fields.push(field)
      field = ""
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++
      fields.push(field)
      records.push({ line: recordLine, fields })
      fields = []
      field = ""
      line++
      recordLine = line
    } else {
      field += char
    }
  }
  if (field !== "" || fields.length > 0) {
    fields.push(field)
    records.push({ line: recordLine, fields })
  }
  return records
}

function count(text: string, char: string) {
  return text.split(char).length - 1
}
