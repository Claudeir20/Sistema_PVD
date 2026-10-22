import { apiFetch } from "./api"

export type Role = "ADMIN" | "CAIXA"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: Role
  active: boolean
  createdAt: string
}

/** Pede ao Spring o cookie XSRF-TOKEN. Chamar ao abrir o app e depois do logout. */
export function fetchCsrfToken() {
  return apiFetch<void>("/api/auth/csrf")
}

export function login(email: string, password: string) {
  return apiFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export function fetchCurrentUser() {
  return apiFetch<AuthUser>("/api/auth/me")
}

export function logout() {
  return apiFetch<void>("/api/auth/logout", { method: "POST" })
}

export const roleLabels: Record<Role, string> = {
  ADMIN: "Administrador",
  CAIXA: "Caixa",
}
