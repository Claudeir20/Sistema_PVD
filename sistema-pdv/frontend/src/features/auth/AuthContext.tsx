import {
  createContext,
  useContext,
  useEffect,
  useState,
  type PropsWithChildren,
} from "react"
import { ApiError, onSessionExpired } from "../../services/api"
import * as authService from "../../services/auth"
import type { AuthUser } from "../../services/auth"

interface AuthContextValue {
  user: AuthUser | null
  loading: boolean
  /** A sessão expirou com o app aberto (a tela de login avisa). */
  sessionExpired: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Guarda quem está logado. Ao abrir, pergunta ao backend se já existe sessão (F5 não desloga). */
export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpired, setSessionExpired] = useState(false)

  // Sessão expirou no servidor: limpa o usuário e o RequireAuth manda para o login.
  useEffect(() => {
    onSessionExpired(() => {
      setUser(null)
      setSessionExpired(true)
    })
    return () => onSessionExpired(null)
  }, [])

  useEffect(() => {
    authService
      .fetchCsrfToken()
      .then(() => authService.fetchCurrentUser())
      .then(setUser)
      .catch((error) => {
        // 401 = ninguém logado, situação normal ao abrir o app.
        if (!(error instanceof ApiError && error.status === 401)) {
          console.error(error)
        }
      })
      .finally(() => setLoading(false))
  }, [])

  async function login(email: string, password: string) {
    const loggedUser = await authService.login(email, password)
    setUser(loggedUser)
    setSessionExpired(false)
    return loggedUser
  }

  async function logout() {
    await authService.logout()
    setUser(null)
    // O logout apaga o token CSRF; sem um novo, o próximo login daria 403.
    await authService.fetchCsrfToken()
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, sessionExpired, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth precisa estar dentro do AuthProvider")
  }
  return context
}
