import type { PropsWithChildren } from "react"
import { Navigate, useLocation } from "react-router-dom"
import type { Role } from "../../services/auth"
import { useAuth } from "./AuthContext"

interface RequireAuthProps extends PropsWithChildren {
  /** Sem a lista, basta estar logado. */
  roles?: Role[]
}

/**
 * Só melhora a experiência (redireciona em vez de mostrar erro).
 * Quem protege de verdade é o SecurityConfig no backend.
 */
export default function RequireAuth({ roles, children }: RequireAuthProps) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <p className="p-8 text-sm text-neutral-500">Carregando...</p>
  }
  if (!user) {
    // Guarda de onde veio para voltar para lá depois do login.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }
  if (roles && !roles.includes(user.role)) {
    return <Navigate to="/vender" replace />
  }
  return children
}
