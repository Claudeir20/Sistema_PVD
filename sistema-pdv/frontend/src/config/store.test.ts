import { describe, expect, it } from "vitest"
import { storeInitials } from "./store"

describe("storeInitials", () => {
  it("takes the first and last words", () => {
    expect(storeInitials("Minha Loja")).toBe("ML")
    expect(storeInitials("Celulares do João")).toBe("CJ")
    expect(storeInitials("Mundo das Capinhas e Acessórios")).toBe("MA")
  })

  it("uses two letters of a single word", () => {
    expect(storeInitials("Celmax")).toBe("CE")
  })
})
