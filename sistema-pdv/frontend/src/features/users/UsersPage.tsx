import { useCallback, useEffect, useState } from "react"
import Badge from "../../components/ui/Badge"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import PageHeader from "../../components/ui/PageHeader"
import { formatDate } from "../../domain/formatters"
import { roleLabels, type Role } from "../../services/auth"
import {
  changeUserRole,
  createUser,
  deactivateUser,
  fetchUsers,
  reactivateUser,
  type CreateUserData,
  type User,
} from "../../services/users"
import { useAuth } from "../auth/AuthContext"
import ChangeRoleDialog from "./components/ChangeRoleDialog"
import DeactivateUserDialog from "./components/DeactivateUserDialog"
import UserFormDialog from "./components/UserFormDialog"

type OpenDialog =
  | { type: "NONE" }
  | { type: "CREATE" }
  | { type: "ROLE"; user: User }
  | { type: "DEACTIVATE"; user: User }

const roleBadge: Record<Role, "info" | "neutral" | "warning"> = {
  ADMIN: "info",
  CAIXA: "neutral",
  TECNICO: "warning",
}

/** Usuários do sistema (só ADMIN): cadastrar, trocar perfil, desativar e reativar. */
export default function UsersPage() {
  const { user: loggedUser } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [dialog, setDialog] = useState<OpenDialog>({ type: "NONE" })
  const [notice, setNotice] = useState("")
  const [reactivatingId, setReactivatingId] = useState<string | null>(null)

  const reload = useCallback(async () => {
    setLoading(true)
    setLoadError("")
    try {
      setUsers(await fetchUsers())
    } catch (err) {
      setLoadError(
        err instanceof Error ? err.message : "Não foi possível carregar.",
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void reload()
  }, [reload])

  const closeDialog = useCallback(() => setDialog({ type: "NONE" }), [])

  async function finish(message: string) {
    closeDialog()
    await reload()
    setNotice(message)
  }

  async function create(data: CreateUserData) {
    const created = await createUser(data)
    await finish(`${created.name} cadastrado como ${roleLabels[created.role]}.`)
  }

  /** Reativar não precisa de confirmação: só devolve o acesso. */
  async function reactivate(user: User) {
    setReactivatingId(user.id)
    try {
      await reactivateUser(user.id)
      await finish(`${user.name} reativado.`)
    } catch (err) {
      setNotice(
        err instanceof Error ? err.message : "Não foi possível reativar.",
      )
    } finally {
      setReactivatingId(null)
    }
  }

  const activeCount = users.filter((user) => user.active).length

  return (
    <main className="min-w-0 flex-1 bg-[#f4f4f2] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1400px]">
        <PageHeader
          actions={
            <Button
              onClick={() => setDialog({ type: "CREATE" })}
              variant="primary"
            >
              Novo usuário
            </Button>
          }
          description="Quem pode entrar no sistema e o que cada pessoa pode fazer."
          title="Usuários"
        />

        <p className="mt-6 text-sm text-neutral-500">
          {activeCount} ativo{activeCount === 1 ? "" : "s"} de {users.length}
        </p>

        {notice ? (
          <p
            className="mt-4 rounded-lg border border-neutral-200 bg-white px-4 py-3 text-sm text-neutral-700"
            role="status"
          >
            {notice}
          </p>
        ) : null}

        <Card className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-neutral-200 text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-4 py-3 font-medium">Nome</th>
                <th className="px-4 py-3 font-medium">E-mail</th>
                <th className="px-4 py-3 font-medium">Perfil</th>
                <th className="px-4 py-3 font-medium">Situação</th>
                <th className="px-4 py-3 font-medium">Desde</th>
                <th className="px-4 py-3 text-right font-medium">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {users.map((user) => {
                const isMe = user.id === loggedUser?.id
                return (
                  <tr
                    className={user.active ? "" : "text-neutral-400"}
                    key={user.id}
                  >
                    <td className="px-4 py-3 font-medium">
                      <span className={user.active ? "text-neutral-900" : ""}>
                        {user.name}
                      </span>
                      {isMe ? (
                        <span className="ml-2 text-xs text-neutral-500">
                          (você)
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">{user.email}</td>
                    <td className="px-4 py-3">
                      <Badge variant={roleBadge[user.role]}>
                        {roleLabels[user.role]}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      {user.active ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge>Desativado</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-neutral-500">
                      {formatDate(user.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      {/* O próprio admin não muda o perfil nem se desativa: ficaria trancado fora. */}
                      {isMe ? null : (
                        <div className="flex justify-end gap-1.5">
                          {user.active ? (
                            <>
                              <ActionButton
                                onClick={() =>
                                  setDialog({ type: "ROLE", user })
                                }
                              >
                                Mudar perfil
                              </ActionButton>
                              <ActionButton
                                danger
                                onClick={() =>
                                  setDialog({ type: "DEACTIVATE", user })
                                }
                              >
                                Desativar
                              </ActionButton>
                            </>
                          ) : (
                            <ActionButton
                              disabled={reactivatingId === user.id}
                              onClick={() => void reactivate(user)}
                            >
                              {reactivatingId === user.id
                                ? "Reativando..."
                                : "Reativar"}
                            </ActionButton>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>

          {loadError ? (
            <p
              className="px-4 py-8 text-center text-sm text-red-700"
              role="alert"
            >
              Não foi possível carregar os usuários: {loadError}{" "}
              <button
                className="font-semibold underline"
                onClick={() => void reload()}
                type="button"
              >
                Tentar de novo
              </button>
            </p>
          ) : null}
          {loading && users.length === 0 && !loadError ? (
            <p className="px-4 py-8 text-center text-sm text-neutral-500">
              Carregando usuários...
            </p>
          ) : null}
        </Card>
      </div>

      {dialog.type === "CREATE" ? (
        <UserFormDialog onClose={closeDialog} onSave={create} />
      ) : null}

      {dialog.type === "ROLE" ? (
        <ChangeRoleDialog
          onClose={closeDialog}
          onSave={async (role) => {
            const updated = await changeUserRole(dialog.user.id, role)
            await finish(`${updated.name} agora é ${roleLabels[updated.role]}.`)
          }}
          user={dialog.user}
        />
      ) : null}

      {dialog.type === "DEACTIVATE" ? (
        <DeactivateUserDialog
          onClose={closeDialog}
          onConfirm={async () => {
            await deactivateUser(dialog.user.id)
            await finish(`${dialog.user.name} desativado.`)
          }}
          user={dialog.user}
        />
      ) : null}
    </main>
  )
}

function ActionButton({
  danger = false,
  ...props
}: { danger?: boolean } & Parameters<typeof Button>[0]) {
  return (
    <Button
      className="min-h-9 px-3 text-xs"
      variant={danger ? "danger" : "secondary"}
      {...props}
    />
  )
}
