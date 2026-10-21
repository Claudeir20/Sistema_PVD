import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../components/ui/Button"
import { roleLabels } from "../../services/auth"
import { useAuth } from "./AuthContext"

/** Nome e perfil de quem está logado, com o botão Sair. Usado nos dois layouts. */
export default function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [leaving, setLeaving] = useState(false)

  // Os layouts só aparecem dentro do RequireAuth, mas o TypeScript não sabe disso.
  if (!user) return null

  async function handleLogout() {
    setLeaving(true)
    try {
      await logout()
    } finally {
      // Mesmo se a API falhar, volta para o login (sem lembrar a página atual).
      navigate("/login", { replace: true })
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-neutral-900">
          {user.name}
        </p>
        <p className="text-xs text-neutral-500">{roleLabels[user.role]}</p>
      </div>
      <Button onClick={handleLogout} disabled={leaving}>
        {leaving ? "Saindo..." : "Sair"}
      </Button>
    </div>
  )
}
