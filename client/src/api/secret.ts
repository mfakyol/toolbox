// One-time secret API client. Content is only ever returned by reveal(), once.

export type SecretStatus = "active" | "viewed" | "expired";

// Metadata only — never contains the secret content.
export interface SecretSummary {
  id: string;
  token: string;
  status: SecretStatus;
  requireLogin: boolean;
  hasPassphrase: boolean;
  viewedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

export interface SecretMeta {
  status: SecretStatus;
  requireLogin: boolean;
  hasPassphrase: boolean;
  expiresAt: string;
  createdAt: string;
}

export interface CreateSecretInput {
  content: string;
  passphrase?: string;
  ttlSeconds: number;
  requireLogin: boolean;
}

async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || `Sunucu hatası (${res.status})`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

export function createSecret(
  input: CreateSecretInput
): Promise<{ secret: SecretSummary }> {
  return api("/api/secrets", { method: "POST", body: JSON.stringify(input) });
}

export function listSecrets(): Promise<{ secrets: SecretSummary[] }> {
  return api("/api/secrets");
}

export function getSecretMeta(token: string): Promise<{ meta: SecretMeta }> {
  return api(`/api/secrets/${encodeURIComponent(token)}/meta`);
}

export function revealSecret(
  token: string,
  passphrase?: string
): Promise<{ content: string }> {
  return api(`/api/secrets/${encodeURIComponent(token)}/reveal`, {
    method: "POST",
    body: JSON.stringify({ passphrase }),
  });
}

// Full shareable URL for a secret token.
export function secretUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}
