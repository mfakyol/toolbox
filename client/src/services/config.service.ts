// Public runtime config, read once on load. Decides whether the app shows the
// login flow and the admin/users area (mirrors the server's AUTH_REQUIRED).
import { type Result } from "./result";
import { requestJson } from "./http";

export interface AppConfig {
  authRequired: boolean;
}

export function fetchConfig(): Promise<Result<AppConfig>> {
  return requestJson("/api/config");
}
