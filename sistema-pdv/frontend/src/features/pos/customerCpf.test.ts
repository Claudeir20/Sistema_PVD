import { describe, expect, it } from "vitest"
import { isValidCpf, normalizeCpf } from "./customerCpf"

describe("CPF validation", () => {
  it("normalizes punctuation", () => {
    expect(normalizeCpf("529.982.247-25")).toBe("52998224725")
  })

  it("accepts valid check digits", () => {
    expect(isValidCpf("529.982.247-25")).toBe(true)
  })

  it("rejects invalid check digits", () => {
    expect(isValidCpf("529.982.247-24")).toBe(false)
  })

  it("rejects repeated digits", () => {
    expect(isValidCpf("111.111.111-11")).toBe(false)
  })
})
