import { useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { User } from "../../../services/users"

interface DeactivateUserDialogProps {
  user: User
  onClose: () => void
  onConfirm: () => Promise<void>
}

export default function DeactivateUserDialog({
  user,
  onClose,
  onConfirm,
}: DeactivateUserDialogProps) {
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function confirm() {
    setSaving(true)
    setError("")
    try {
      await onConfirm()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Não foi possível desativar.",
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onClose={onClose} open title="Desativar usuário">
      <p className="text-sm leading-6 text-neutral-600">
        <strong className="text-neutral-900">{user.name}</strong> não vai
        conseguir entrar no sistema. O nome continua nas vendas que a pessoa já
        fez, e dá para reativar depois.
      </p>
      {error ? (
        <p className="mt-3 text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div className="mt-5 grid grid-cols-2 gap-2">
        <Button disabled={saving} onClick={onClose}>
          Cancelar
        </Button>
        <Button
          disabled={saving}
          onClick={() => void confirm()}
          variant="danger"
        >
          {saving ? "Desativando..." : "Desativar"}
        </Button>
      </div>
    </Dialog>
  )
}
