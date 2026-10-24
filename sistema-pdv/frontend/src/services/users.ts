import { apiFetch } from "./api"
import type { AuthUser, Role } from "./auth"

/** O UserResponse do backend tem o mesmo formato do usuário logado. */
export type User = AuthUser

export interface CreateUserData {
  name: string
  email: string
  password: string
  role: Role
}

/** Todos os usuários, ativos e desativados, por nome. Só ADMIN. */
export function fetchUsers() {
  return apiFetch<User[]>("/api/users")
}

export function createUser(data: CreateUserData) {
  return apiFetch<User>("/api/users", {
    method: "POST",
    body: JSON.stringify(data),
  })
}

export function changeUserRole(userId: string, role: Role) {
  return apiFetch<User>(`/api/users/${userId}/role`, {
    method: "PUT",
    body: JSON.stringify({ role }),
  })
}

/** Impede o login sem apagar: o nome continua nas vendas que a pessoa fez. */
export function deactivateUser(userId: string) {
  return apiFetch<User>(`/api/users/${userId}/deactivate`, { method: "POST" })
}

export function reactivateUser(userId: string) {
  return apiFetch<User>(`/api/users/${userId}/reactivate`, { method: "POST" })
}

/** O admin define uma senha nova para outro usuário (ex.: o caixa esqueceu). */
export function resetUserPassword(userId: string, newPassword: string) {
  return apiFetch<void>(`/api/users/${userId}/password`, {
    method: "POST",
    body: JSON.stringify({ newPassword }),
  })
}
