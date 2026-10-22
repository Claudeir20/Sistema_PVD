import { useState, type FormEvent } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import { roleLabels, type Role } from "../../../services/auth"
import type { CreateUserData } from "../../../services/users"

interface UserFormDialogProps {
  onClose: () => void
  /** Pode falhar (ex.: e-mail já usado): o erro aparece no próprio diálogo. */
  onSave: (data: CreateUserData) => Promise<void>
}

const inputClass =
  "h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

/** Os mesmos limites do CreateUserRequest no backend. */
const PASSWORD_MIN = 6
const PASSWORD_MAX = 72

/** Cadastro de usuário. A página só monta o diálogo ao abrir, então ele nasce vazio. */
export default function UserFormDialog({
  onClose,
  onSave,
}: UserFormDialogProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState<Role>("CAIXA")
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (password.length < PASSWORD_MIN || password.length > PASSWORD_MAX) {
      setError(
        `A senha deve ter de ${PASSWORD_MIN} a ${PASSWORD_MAX} caracteres.`,
      )
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave({ name: name.trim(), email: email.trim(), password, role })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onClose={onClose} open title="Novo usuário">
      <form className="space-y-3" onSubmit={handleSubmit}>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nome
          </span>
          <input
            autoFocus
            className={inputClass}
            maxLength={100}
            onChange={(event) => setName(event.target.value)}
            required
            value={name}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            E-mail (usado no login)
          </span>
          <input
            autoComplete="off"
            className={inputClass}
            maxLength={150}
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Senha inicial
          </span>
          <input
            autoComplete="new-password"
            className={inputClass}
            maxLength={PASSWORD_MAX}
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
          <span className="mt-1 block text-xs text-neutral-500">
            De {PASSWORD_MIN} a {PASSWORD_MAX} caracteres. Passe para a pessoa
            com segurança.
          </span>
        </label>

        <RoleSelect onChange={setRole} value={role} />

        {error ? (
          <p className="text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : null}

        <div className="grid grid-cols-2 gap-2 pt-2">
          <Button disabled={saving} onClick={onClose}>
            Cancelar
          </Button>
          <Button disabled={saving} type="submit" variant="primary">
            {saving ? "Salvando..." : "Cadastrar"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}

const roleDescriptions: Record<Role, string> = {
  ADMIN: "Tudo: produtos, usuários, painel e cancelamentos.",
  CAIXA: "Vende no PDV e registra reposição.",
}

/** Escolha do perfil com a explicação de cada um (usado no cadastro e na troca). */
export function RoleSelect({
  value,
  onChange,
}: {
  value: Role
  onChange: (role: Role) => void
}) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-neutral-700">
        Perfil
      </legend>
      <div className="space-y-2">
        {(Object.keys(roleLabels) as Role[]).map((role) => (
          <label
            className={`flex cursor-pointer gap-3 rounded-lg border px-3 py-2.5 ${
              value === role
                ? "border-blue-600 bg-blue-50"
                : "border-neutral-300 hover:border-neutral-400"
            }`}
            key={role}
          >
            <input
              checked={value === role}
              className="mt-1"
              name="role"
              onChange={() => onChange(role)}
              type="radio"
            />
            <span>
              <span className="block text-sm font-semibold text-neutral-900">
                {roleLabels[role]}
              </span>
              <span className="block text-xs text-neutral-500">
                {roleDescriptions[role]}
              </span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}
