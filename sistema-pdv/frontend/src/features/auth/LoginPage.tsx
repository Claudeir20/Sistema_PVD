import { useState, type FormEvent } from "react"
import { Navigate, useLocation, useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import { ApiError } from "../../services/api"
import { useAuth } from "./AuthContext"

export default function LoginPage() {
  const { user, loading, sessionExpired, login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const from = (location.state as { from?: string } | null)?.from

  if (loading) {
    return <p className="p-8 text-sm text-neutral-500">Carregando...</p>
  }
  // Já logado (ex.: abriu /login de novo): segue direto.
  if (user && !submitting) {
    return <Navigate to={from ?? homeFor(user.role)} replace />
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const loggedUser = await login(email, password)
      navigate(from ?? homeFor(loggedUser.role), { replace: true })
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "Não foi possível conectar ao servidor.",
      )
      setSubmitting(false)
    }
  }

  return (
    <main className="grid min-h-dvh place-items-center bg-[#f4f4f2] px-4">
      <Card className="w-full max-w-sm p-6">
        <h1 className="text-xl font-bold text-neutral-900">Entrar</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Use o e-mail e a senha cadastrados.
        </p>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <label className="block text-sm font-medium text-neutral-700">
            E-mail
            <input
              className="mt-1 block min-h-12 w-full rounded-lg border border-[#cfceca] px-3"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className="block text-sm font-medium text-neutral-700">
            Senha
            <input
              className="mt-1 block min-h-12 w-full rounded-lg border border-[#cfceca] px-3"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          {sessionExpired && !error && (
            <p
              role="status"
              className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900"
            >
              Sua sessão expirou. Entre de novo.
            </p>
          )}

          {error && (
            <p role="alert" className="text-sm text-[#b42318]">
              {error}
            </p>
          )}

          <Button
            type="submit"
            variant="primary"
            fullWidth
            disabled={submitting}
          >
            {submitting ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </Card>
    </main>
  )
}

/** ADMIN cai no painel; caixa e técnico, no PDV. */
function homeFor(role: string) {
  return role === "ADMIN" ? "/painel" : "/vender"
}
