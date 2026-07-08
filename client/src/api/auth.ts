// Auth + admin API clients. All requests include the session cookie.

export type Role = "admin" | "user";

export interface AuthUser {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  createdAt?: string;
}

// Wraps fetch with cookies + JSON, throwing the backend message on error.
async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Sunucu hatası (${res.status})`);
  }
  return res.json() as Promise<T>;
}

export function fetchMe(): Promise<{ user: AuthUser | null }> {
  return api("/api/auth/me");
}

export function login(
  email: string,
  password: string,
  rememberMe: boolean
): Promise<{ user: AuthUser }> {
  return api("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password, rememberMe }),
  });
}

export function logout(): Promise<{ ok: boolean }> {
  return api("/api/auth/logout", { method: "POST" });
}

export function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ user: AuthUser }> {
  return api("/api/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

// ---- Admin ----

export function listUsers(): Promise<{ users: AuthUser[] }> {
  return api("/api/admin/users");
}

export function createUser(
  email: string,
  password: string,
  role: Role
): Promise<{ user: AuthUser }> {
  return api("/api/admin/users", {
    method: "POST",
    body: JSON.stringify({ email, password, role }),
  });
}

export function deleteUser(id: string): Promise<{ ok: boolean }> {
  return api(`/api/admin/users/${id}`, { method: "DELETE" });
}
