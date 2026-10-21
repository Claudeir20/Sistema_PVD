/** Erro vindo da API: o status HTTP e a mensagem em português do backend. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

function readCookie(name: string): string | undefined {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith(`${name}=`))
    ?.split("=")[1]
}

/**
 * Todas as chamadas à API passam por aqui: manda o token CSRF, envia JSON
 * e transforma o {"message": ...} do backend em ApiError.
 */
export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers)
  if (options.body) headers.set("Content-Type", "application/json")

  // O Spring confere se o cabeçalho tem o mesmo valor do cookie XSRF-TOKEN.
  const csrfToken = readCookie("XSRF-TOKEN")
  if (csrfToken) headers.set("X-XSRF-TOKEN", decodeURIComponent(csrfToken))

  const response = await fetch(path, {
    ...options,
    headers,
    credentials: "same-origin",
  })

  if (!response.ok) {
    const body = await response.json().catch(() => null)
    throw new ApiError(
      response.status,
      body?.message ?? "Não foi possível completar a operação.",
    )
  }

  // 204 (sem corpo): csrf e logout.
  return (response.status === 204 ? undefined : await response.json()) as T
}
