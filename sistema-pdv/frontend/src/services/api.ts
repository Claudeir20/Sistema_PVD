/** Erro vindo da API: o status HTTP e a mensagem em português do backend. */
export class ApiError extends Error {
  readonly status: number
  /** O JSON de erro inteiro, para respostas com mais que a mensagem (ex.: erros por linha). */
  readonly body: unknown

  constructor(status: number, message: string, body: unknown = null) {
    super(message)
    this.status = status
    this.body = body
  }
}

/** Backend parado: o fetch nem conecta, ou o proxy do Vite responde 5xx sem o JSON de erro. */
export const SERVER_UNAVAILABLE_MESSAGE =
  "Servidor indisponível. Verifique se o backend está rodando."

/**
 * 401 nestas rotas é resposta normal (senha errada, ninguém logado ao abrir o app).
 * Em qualquer outra, quer dizer que a sessão expirou com a tela aberta.
 */
const ROUTES_WITHOUT_SESSION = ["/api/auth/login", "/api/auth/me"]

let sessionExpiredListener: (() => void) | null = null

/** O AuthContext se registra aqui para voltar ao login quando a sessão expirar. */
export function onSessionExpired(listener: (() => void) | null) {
  sessionExpiredListener = listener
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

  let response: Response
  try {
    response = await fetch(path, {
      ...options,
      headers,
      credentials: "same-origin",
    })
  } catch {
    // Sem resposta nenhuma (servidor desligado, rede caiu): status 0.
    throw new ApiError(0, SERVER_UNAVAILABLE_MESSAGE)
  }

  if (!response.ok) {
    if (response.status === 401 && !ROUTES_WITHOUT_SESSION.includes(path)) {
      sessionExpiredListener?.()
    }

    const body = await response.json().catch(() => null)
    if (body?.message) throw new ApiError(response.status, body.message, body)

    // Sem a mensagem do backend: 5xx quase sempre é o servidor fora do ar.
    throw new ApiError(
      response.status,
      response.status >= 500
        ? SERVER_UNAVAILABLE_MESSAGE
        : "Não foi possível completar a operação.",
    )
  }

  // 204 (sem corpo): csrf e logout.
  return (response.status === 204 ? undefined : await response.json()) as T
}
