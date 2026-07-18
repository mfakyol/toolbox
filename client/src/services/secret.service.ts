// One-time secret service. Content is only ever returned by reveal(), once.
import { type Result } from "./result";
import { requestJson } from "./http";

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

export function createSecret(
  input: CreateSecretInput
): Promise<Result<{ secret: SecretSummary }>> {
  return requestJson("/api/secrets", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function listSecrets(): Promise<Result<{ secrets: SecretSummary[] }>> {
  return requestJson("/api/secrets");
}

export function getSecretMeta(
  token: string
): Promise<Result<{ meta: SecretMeta }>> {
  return requestJson(`/api/secrets/${encodeURIComponent(token)}/meta`);
}

export function revealSecret(
  token: string,
  passphrase?: string
): Promise<Result<{ content: string }>> {
  return requestJson(`/api/secrets/${encodeURIComponent(token)}/reveal`, {
    method: "POST",
    body: JSON.stringify({ passphrase }),
  });
}

// Full shareable URL for a secret token (pure — no request).
export function secretUrl(token: string): string {
  return `${window.location.origin}/s/${token}`;
}
