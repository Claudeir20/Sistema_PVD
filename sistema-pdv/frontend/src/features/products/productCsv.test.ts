import { describe, expect, it } from "vitest"
import { CSV_TEMPLATE, decodeCsvBytes, parseProductsCsv } from "./productCsv"

describe("parseProductsCsv", () => {
  it("reads the template (Excel in Portuguese: ';' and comma decimals)", () => {
    const { rows, fileError } = parseProductsCsv(CSV_TEMPLATE)

    expect(fileError).toBeNull()
    expect(rows.map((row) => row.item)).toEqual([
      {
        line: 2,
        barcode: "7891000000011",
        name: "Cabo USB-C",
        priceInCents: 2990,
        minStock: 5,
        initialStock: 20,
      },
      {
        line: 3,
        barcode: "CAP20",
        name: "Capinha iPhone 13",
        priceInCents: 2000,
        minStock: 2,
        initialStock: 10,
      },
    ])
  })

  it("accepts ',' as separator, quotes, BOM, R$ and headers with accents", () => {
    const csv =
      "﻿Código,Nome,Preço,Estoque Mínimo\n" +
      'A1,"Cabo, 2 metros","R$ 1.299,90",\n' +
      'A2,"Fone ""pro""",15.5,3\n'

    const { rows, fileError } = parseProductsCsv(csv)

    expect(fileError).toBeNull()
    expect(rows[0].item).toMatchObject({
      name: "Cabo, 2 metros",
      priceInCents: 129990,
      minStock: 0,
      initialStock: null,
    })
    expect(rows[1].item).toMatchObject({
      name: 'Fone "pro"',
      priceInCents: 1550,
      minStock: 3,
    })
  })

  it("points the error to the file line, skipping blank lines", () => {
    const csv =
      "codigo;nome;preco\n" +
      "A1;Cabo;10,00\n" +
      "\n" +
      "A2;;10,00\n" +
      "A3;Fone;0\n" +
      "A4;Capa;abc\n" +
      "A5;Capa;\n" +
      "A1;Cabo de novo;5,00\n"

    const { rows } = parseProductsCsv(csv)

    expect(rows.map((row) => [row.line, row.error])).toEqual([
      [2, null],
      [4, "Informe o nome do produto."],
      [5, "O preço deve ser maior que zero."],
      [6, "Preço inválido. Use, por exemplo, 29,90."],
      [7, "Informe o preço."],
      [8, "Código A1 repetido no arquivo."],
    ])
  })

  it("rejects quantities that are not whole numbers", () => {
    const csv =
      "codigo;nome;preco;estoque_minimo;estoque_inicial\n" +
      "A1;Cabo;10;-1;\n" +
      "A2;Fone;10;1;2,5\n"

    const { rows } = parseProductsCsv(csv)

    expect(rows[0].error).toBe(
      "O estoque mínimo deve ser um número inteiro (0 ou mais).",
    )
    expect(rows[1].error).toBe(
      "O estoque inicial deve ser um número inteiro (0 ou mais).",
    )
  })

  it("explains what is wrong with the whole file", () => {
    expect(parseProductsCsv("").fileError).toBe("O arquivo está vazio.")
    expect(parseProductsCsv("codigo;nome\nA1;Cabo\n").fileError).toContain(
      "codigo, nome e preco",
    )
    expect(parseProductsCsv("codigo;nome;preco\n\n").fileError).toBe(
      "O arquivo não tem produtos.",
    )
  })
})

describe("decodeCsvBytes", () => {
  it("reads UTF-8 and falls back to Windows-1252 (Excel)", () => {
    const utf8 = new TextEncoder().encode("Preço").buffer
    const windows1252 = new Uint8Array([0x50, 0x72, 0x65, 0xe7, 0x6f]).buffer

    expect(decodeCsvBytes(utf8)).toBe("Preço")
    expect(decodeCsvBytes(windows1252)).toBe("Preço")
  })
})
