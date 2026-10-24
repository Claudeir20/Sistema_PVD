import { describe, expect, it } from "vitest"
import { cancellationReasonError } from "./cancellationReason"

describe("cancellationReasonError", () => {
  it("accepts a reason with 3 to 200 characters", () => {
    expect(cancellationReasonError("Cliente desistiu")).toBeNull()
    expect(cancellationReasonError("abc")).toBeNull()
    expect(cancellationReasonError("a".repeat(200))).toBeNull()
  })

  it("does not count the spaces around the text", () => {
    expect(cancellationReasonError("  ab  ")).toBe(
      "Informe o motivo do cancelamento.",
    )
    expect(cancellationReasonError("   ")).toBe(
      "Informe o motivo do cancelamento.",
    )
  })

  it("rejects more than 200 characters", () => {
    expect(cancellationReasonError("a".repeat(201))).toBe(
      "O motivo deve ter de 3 a 200 caracteres.",
    )
  })
})
