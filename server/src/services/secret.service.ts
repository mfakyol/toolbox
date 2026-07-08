// One-time secret business logic. Decoupled from Express (like the other
// services) so it can be tested directly.
import { AppError } from "../utils/AppError.js";
import {
  Secret,
  TTL_OPTIONS,
  DEFAULT_TTL,
  CONTENT_FIELDS,
  type SecretDoc,
} from "../models/Secret.js";
import {
  encryptSecret,
  decryptSecret,
  generateToken,
} from "../utils/secretCrypto.js";

const MAX_CONTENT_LENGTH = 100_000; // 100 KB of text

// $set payload that wipes the encrypted content but keeps metadata.
const CLEARED_CONTENT = Object.fromEntries(
  CONTENT_FIELDS.map((f) => [f, null])
);

export interface CreateSecretInput {
  content: string;
  passphrase?: string;
  ttlSeconds?: number;
  requireLogin?: boolean;
}

export async function createSecret(ownerId: string, input: CreateSecretInput) {
  const content = input.content ?? "";
  if (!content.trim()) {
    throw new AppError("İçerik boş olamaz.", 400);
  }
  if (content.length > MAX_CONTENT_LENGTH) {
    throw new AppError("İçerik çok büyük (maks. 100 KB).", 400);
  }

  const ttlSeconds =
    input.ttlSeconds && TTL_OPTIONS.includes(input.ttlSeconds as never)
      ? input.ttlSeconds
      : DEFAULT_TTL;

  const passphrase = input.passphrase?.trim() || "";
  const payload = encryptSecret(content, passphrase);

  const secret = await Secret.create({
    token: generateToken(),
    owner: ownerId,
    ...payload,
    hasPassphrase: passphrase.length > 0,
    requireLogin: Boolean(input.requireLogin),
    status: "active",
    expiresAt: new Date(Date.now() + ttlSeconds * 1000),
  });

  return secret;
}

// Lazily flips an active-but-expired secret to "expired" and wipes content.
async function expireIfNeeded(secret: SecretDoc & { _id: unknown }) {
  if (secret.status === "active" && secret.expiresAt.getTime() <= Date.now()) {
    await Secret.updateOne(
      { _id: secret._id, status: "active" },
      { $set: { status: "expired", ...CLEARED_CONTENT } }
    );
    secret.status = "expired";
  }
  return secret;
}

export async function listByOwner(ownerId: string) {
  const secrets = await Secret.find({ owner: ownerId }).sort({ createdAt: -1 });
  await Promise.all(secrets.map((s) => expireIfNeeded(s as never)));
  return secrets;
}

// Public metadata for the view page — never includes content.
export async function getMeta(token: string) {
  const secret = await Secret.findOne({ token });
  if (!secret) return null;
  await expireIfNeeded(secret as never);
  return {
    status: secret.status,
    requireLogin: secret.requireLogin,
    hasPassphrase: secret.hasPassphrase,
    expiresAt: secret.expiresAt,
    createdAt: (secret as unknown as { createdAt: Date }).createdAt,
  };
}

export interface RevealInput {
  passphrase?: string;
  isAuthed: boolean;
}

// The one-time reveal. Decrypts first (so a wrong passphrase doesn't burn the
// secret), then atomically claims it so concurrent requests can't double-read.
export async function revealSecret(token: string, input: RevealInput) {
  const secret = await Secret.findOne({ token });
  if (!secret) throw new AppError("Sır bulunamadı.", 404);

  await expireIfNeeded(secret as never);

  if (secret.status === "viewed") {
    throw new AppError("Bu sır zaten görüntülendi.", 410);
  }
  if (secret.status === "expired") {
    throw new AppError("Bu sırrın süresi doldu.", 410);
  }
  if (secret.requireLogin && !input.isAuthed) {
    throw new AppError("Bu sırrı görüntülemek için giriş yapmalısınız.", 401);
  }

  let content: string;
  try {
    content = decryptSecret(
      {
        ciphertext: secret.ciphertext!,
        iv: secret.iv!,
        salt: secret.salt!,
        authTag: secret.authTag!,
      },
      input.passphrase?.trim() || ""
    );
  } catch {
    // Wrong passphrase or tampered payload — do NOT consume the secret.
    throw new AppError(
      secret.hasPassphrase ? "Parola hatalı." : "Sır çözülemedi.",
      403
    );
  }

  // Atomically claim: only the first request flipping active→viewed wins.
  const claimed = await Secret.updateOne(
    { token, status: "active" },
    { $set: { status: "viewed", viewedAt: new Date(), ...CLEARED_CONTENT } }
  );
  if (claimed.modifiedCount === 0) {
    throw new AppError("Bu sır zaten görüntülendi.", 410);
  }

  return content;
}

// Background sweep: wipe content of any active secret whose TTL has passed.
export async function sweepExpired() {
  await Secret.updateMany(
    { status: "active", expiresAt: { $lte: new Date() } },
    { $set: { status: "expired", ...CLEARED_CONTENT } }
  );
}

export function startSecretSweeper(intervalMs = 60_000) {
  const timer = setInterval(() => {
    sweepExpired().catch((err) => console.error("Secret sweep hatası:", err));
  }, intervalMs);
  timer.unref?.();
  return timer;
}
