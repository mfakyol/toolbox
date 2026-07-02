// ---- Base64 (UTF-8 safe) ----

export function base64Encode(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function base64Decode(b64: string): string {
  const bin = atob(b64.trim());
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

// ---- JWT decode (does NOT verify the signature) ----

function base64UrlDecode(part: string): string {
  const b64 = part.replace(/-/g, "+").replace(/_/g, "/");
  const padded = b64 + "=".repeat((4 - (b64.length % 4)) % 4);
  return base64Decode(padded);
}

export interface DecodedJwt {
  header: unknown;
  payload: unknown;
}

export function decodeJwt(token: string): DecodedJwt {
  const parts = token.trim().split(".");
  if (parts.length < 2) {
    throw new Error("Invalid JWT: at least two segments expected.");
  }
  return {
    header: JSON.parse(base64UrlDecode(parts[0])),
    payload: JSON.parse(base64UrlDecode(parts[1])),
  };
}

// ---- Hash (SubtleCrypto) ----

export const HASH_ALGOS = ["SHA-1", "SHA-256", "SHA-384", "SHA-512"] as const;
export type HashAlgo = (typeof HASH_ALGOS)[number];

export async function hashText(text: string, algo: HashAlgo): Promise<string> {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest(algo, data);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// ---- UUID ----

export function generateUuids(count: number): string[] {
  return Array.from({ length: count }, () => crypto.randomUUID());
}
