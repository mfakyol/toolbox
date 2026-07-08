// Central configuration. Environment variables are read only here;
// the rest of the app never reads process.env directly.

export interface AppConfig {
  port: number;
  nodeEnv: string;
  isProd: boolean;
  corsOrigin: string;
  maxFileSize: number;
  mongoUri: string;
  sessionSecret: string;
  // When false, the whole app is usable without logging in: auth middleware
  // is skipped, there is no admin/users area, and owner-scoped tools (secrets,
  // transfers) fall back to a shared anonymous owner. Defaults to true (the
  // login-gated behaviour).
  authRequired: boolean;
  // Whether to mark the session cookie "Secure" (HTTPS-only). Must be false
  // when serving over plain HTTP, or the browser will drop the cookie.
  cookieSecure: boolean;
  // "Remember me" cookie lifetime, in milliseconds (1 year by default).
  rememberMeMaxAge: number;
  adminEmail: string;
  adminPassword: string;
  // Server-side key used to encrypt one-time secrets at rest (AES-256-GCM).
  secretEncryptionKey: string;
  // File-transfer storage: directory, total size cap, and file count cap.
  uploadDir: string;
  maxTransferSize: number;
  maxTransferFiles: number;
}

const nodeEnv = process.env.NODE_ENV ?? "development";

export const config: AppConfig = {
  port: Number(process.env.PORT) || 6000,
  nodeEnv,
  isProd: nodeEnv === "production",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  maxFileSize: Number(process.env.MAX_FILE_SIZE) || 25 * 1024 * 1024, // 25MB
  mongoUri: process.env.MONGO_URI ?? "mongodb://localhost:27017/toolbox",
  sessionSecret: process.env.SESSION_SECRET ?? "change-me-in-production",
  authRequired: process.env.AUTH_REQUIRED
    ? process.env.AUTH_REQUIRED === "true"
    : true,
  cookieSecure: process.env.COOKIE_SECURE
    ? process.env.COOKIE_SECURE === "true"
    : nodeEnv === "production",
  rememberMeMaxAge:
    Number(process.env.REMEMBER_ME_MAX_AGE) || 365 * 24 * 60 * 60 * 1000,
  adminEmail: process.env.ADMIN_EMAIL ?? "admin@toolbox.local",
  adminPassword: process.env.ADMIN_PASSWORD ?? "admin1234",
  secretEncryptionKey:
    process.env.SECRET_ENCRYPTION_KEY ?? "change-me-secret-encryption-key",
  uploadDir: process.env.UPLOAD_DIR ?? "uploads",
  maxTransferSize: Number(process.env.MAX_TRANSFER_SIZE) || 2 * 1024 * 1024 * 1024, // 2GB
  maxTransferFiles: Number(process.env.MAX_TRANSFER_FILES) || 20,
};

// Sentinel owner id used for secrets/transfers created while auth is disabled
// (config.authRequired === false). All anonymous items share this owner, so a
// public instance behaves as a single shared space. Never assigned to a real
// User document.
export const ANON_OWNER_ID = "000000000000000000000000";

// The owner id to attribute an owner-scoped action to: the logged-in user when
// present, otherwise the shared anonymous owner (only reachable when auth is
// disabled, since requireAuth guarantees a user when auth is on).
export function ownerId(req: { user?: { id: string } }): string {
  return req.user?.id ?? ANON_OWNER_ID;
}
