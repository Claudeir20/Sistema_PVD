import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { ApiError, apiFetch, SERVER_UNAVAILABLE_MESSAGE } from "./api"

function respond(status: number, body: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(body, { status })),
  )
}

describe("apiFetch errors", () => {
  // Os testes rodam no Node (sem navegador): o apiFetch lê o token CSRF do document.cookie.
  beforeEach(() => vi.stubGlobal("document", { cookie: "" }))
  afterEach(() => vi.unstubAllGlobals())

  it("keeps the backend message", async () => {
    respond(400, JSON.stringify({ message: "Estoque insuficiente." }))

    await expect(apiFetch("/api/sales")).rejects.toMatchObject({
      status: 400,
      message: "Estoque insuficiente.",
    })
  })

  it("says the server is unavailable when it cannot connect", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    )

    const error = await apiFetch("/api/auth/me").catch((err: unknown) => err)

    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({
      status: 0,
      message: SERVER_UNAVAILABLE_MESSAGE,
    })
  })

  it("says the server is unavailable on a 5xx without the backend message", async () => {
    // O proxy do Vite responde assim quando o Spring está parado.
    respond(502, "")

    await expect(apiFetch("/api/auth/login")).rejects.toMatchObject({
      status: 502,
      message: SERVER_UNAVAILABLE_MESSAGE,
    })
  })

  it("keeps the generic message on a 4xx without the backend message", async () => {
    respond(404, "<html>Not Found</html>")

    await expect(apiFetch("/api/nada")).rejects.toMatchObject({
      status: 404,
      message: "Não foi possível completar a operação.",
    })
  })
})
