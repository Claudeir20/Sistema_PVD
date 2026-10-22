import { useState } from "react"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import type { Role } from "../../../services/auth"
import type { User } from "../../../services/users"
import { RoleSelect } from "./UserFormDialog"

interface ChangeRoleDialogProps {
  user: User
  onClose: () => void
  onSave: (role: Role) => Promise<void>
}

/** Troca o perfil. Vale no próximo login da pessoa (a sessão atual guarda o perfil antigo). */
export default function ChangeRoleDialog({
  user,
  onClose,
  onSave,
}: ChangeRoleDialogProps) {
  const [role, setRole] = useState<Role>(user.role)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    setError("")
    try {
      await onSave(role)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog onClose={onClose} open title={`Perfil de ${user.name}`}>
      <RoleSelect onChange={setRole} value={role} />
      <p className="mt-3 text-xs text-neutral-500">
        Se a pessoa estiver logada agora, o perfil novo vale a partir do próximo
        login.
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
          disabled={saving || role === user.role}
          onClick={() => void save()}
          variant="primary"
        >
          {saving ? "Salvando..." : "Salvar"}
        </Button>
      </div>
    </Dialog>
  )
}
