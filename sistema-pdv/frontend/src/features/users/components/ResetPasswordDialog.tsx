import { useState, type FormEvent } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { User } from "../../../services/users"

interface ResetPasswordDialogProps {
  user: User
  onClose: () => void
  onSave: (newPassword: string) => Promise<void>
}

/** Os mesmos limites do backend (e do cadastro de usuário). */
const PASSWORD_MIN = 6
const PASSWORD_MAX = 72

const inputClass =
  "h-11 w-full rounded-lg border border-neutral-300 px-3 outline-none focus:border-blue-600 focus:ring-4 focus:ring-blue-100"

/** O admin define a senha nova; a pessoa troca depois, se quiser. */
export default function ResetPasswordDialog({
  user,
  onClose,
  onSave,
}: ResetPasswordDialogProps) {
  const [password, setPassword] = useState("")
  const [confirmation, setConfirmation] = useState("")
  const [showPassword, setShowPassword] = useState(false)
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
    if (password !== confirmation) {
      setError("As duas senhas não são iguais.")
      return
    }

    setSaving(true)
    setError("")
    try {
      await onSave(password)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onClose={onClose} open title={`Redefinir senha de ${user.name}`}>
      <form className="space-y-3" onSubmit={handleSubmit}>
        <p className="text-sm text-neutral-600">
          A senha atual deixa de valer. Passe a nova senha para a pessoa com
          segurança.
        </p>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Nova senha
          </span>
          <input
            autoComplete="new-password"
            autoFocus
            className={inputClass}
            maxLength={PASSWORD_MAX}
            onChange={(event) => {
              setPassword(event.target.value)
              setError("")
            }}
            type={showPassword ? "text" : "password"}
            value={password}
          />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium text-neutral-700">
            Repita a nova senha
          </span>
          <input
            autoComplete="new-password"
            className={inputClass}
            maxLength={PASSWORD_MAX}
            onChange={(event) => {
              setConfirmation(event.target.value)
              setError("")
            }}
            type={showPassword ? "text" : "password"}
            value={confirmation}
          />
        </label>
        <label className="flex items-center gap-2 text-sm text-neutral-600">
          <input
            checked={showPassword}
            onChange={(event) => setShowPassword(event.target.checked)}
            type="checkbox"
          />
          Mostrar senha
        </label>

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
            {saving ? "Salvando..." : "Redefinir"}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
