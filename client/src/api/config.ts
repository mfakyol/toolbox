// Public runtime config, read once on load. Decides whether the app shows the
// login flow and the admin/users area (mirrors the server's AUTH_REQUIRED).

export interface AppConfig {
  authRequired: boolean;
}

export async function fetchConfig(): Promise<AppConfig> {
  const res = await fetch("/api/config", { credentials: "include" });
  if (!res.ok) throw new Error(`Sunucu hatası (${res.status})`);
  return res.json() as Promise<AppConfig>;
}
