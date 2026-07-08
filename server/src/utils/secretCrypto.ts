// AES-256-GCM encryption for one-time secrets. The key is derived from the
// server-side key plus an optional passphrase, so a passphrase-protected
// secret cannot be decrypted without it (wrong passphrase → GCM auth failure).
import crypto from "node:crypto";
import { config } from "../config/index.js";

const ALGO = "aes-256-gcm";

export interface EncryptedPayload {
  ciphertext: string; // base64
  iv: string; // base64
  salt: string; // base64
  authTag: string; // base64
}

function deriveKey(passphrase: string, salt: Buffer): Buffer {
  // scrypt binds the server key + passphrase to a per-secret salt.
  return crypto.scryptSync(config.secretEncryptionKey + passphrase, salt, 32);
}

export function encryptSecret(
  plaintext: string,
  passphrase = ""
): EncryptedPayload {
  const salt = crypto.randomBytes(16);
  const iv = crypto.randomBytes(12);
  const key = deriveKey(passphrase, salt);

  const cipher = crypto.createCipheriv(ALGO, key, iv);
  const ciphertext = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  return {
    ciphertext: ciphertext.toString("base64"),
    iv: iv.toString("base64"),
    salt: salt.toString("base64"),
    authTag: cipher.getAuthTag().toString("base64"),
  };
}

// Throws if the payload is tampered with or the passphrase is wrong.
export function decryptSecret(
  payload: EncryptedPayload,
  passphrase = ""
): string {
  const key = deriveKey(passphrase, Buffer.from(payload.salt, "base64"));
  const decipher = crypto.createDecipheriv(
    ALGO,
    key,
    Buffer.from(payload.iv, "base64")
  );
  decipher.setAuthTag(Buffer.from(payload.authTag, "base64"));

  const plaintext = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, "base64")),
    decipher.final(),
  ]);
  return plaintext.toString("utf8");
}

// URL-safe random token used as the secret's public identifier.
export function generateToken(): string {
  return crypto.randomBytes(18).toString("base64url");
}
