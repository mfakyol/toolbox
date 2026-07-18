// Auth + admin service. Every call returns a Result; the session cookie rides along.
import { type Result } from "./result";
import { requestJson } from "./http";

export type Role = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt?: string;
}

export function fetchMe(): Promise<Result<{ user: AuthUser | null }>> {
  return requestJson("/api/auth/me");
}

export function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<Result<{ user: AuthUser }>> {
  return requestJson("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export function logout(): Promise<Result<{ ok: boolean }>> {
  return requestJson("/api/auth/logout", { method: "POST" });
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<Result<{ user: AuthUser }>> {
  return requestJson("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ---- Admin ----

export function listUsers(): Promise<Result<{ users: AuthUser[] }>> {
  return requestJson("/api/admin/users");
}

export function createUser(
  email: string,
  password: string,
  role: Role
): Promise<Result<{ user: AuthUser }>> {
  return requestJson("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export function deleteUser(id: string): Promise<Result<{ ok: boolean }>> {
  return requestJson(`/api/admin/users/${id}`, { method: "DELETE" });
}
