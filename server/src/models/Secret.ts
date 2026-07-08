import mongoose, { Schema, type InferSchemaType } from "mongoose";

// Lifecycle of a one-time secret:
//   active → viewed  (revealed once, content wiped, metadata kept for history)
//   active → expired (TTL passed without a view, content wiped)
export const SECRET_STATUS = ["active", "viewed", "expired"] as const;
export type SecretStatus = (typeof SECRET_STATUS)[number];

// Allowed TTLs in seconds (1h / 1d / 7d / 30d); 7 days is the default.
export const TTL_OPTIONS = [3600, 86400, 604800, 2592000] as const;
export const DEFAULT_TTL = 604800;

// Fields that hold the actual encrypted content. Cleared the moment a secret
// is viewed or expires — only metadata survives.
export const CONTENT_FIELDS = [
  "ciphertext",
  "iv",
  "salt",
  "authTag",
] as const;

const secretSchema = new Schema(
  {
    // Public, URL-safe identifier (the share link).
    token: { type: String, required: true, unique: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // Encrypted payload (AES-256-GCM). Wiped after view/expiry.
    ciphertext: { type: String, default: null },
    iv: { type: String, default: null },
    salt: { type: String, default: null },
    authTag: { type: String, default: null },

    hasPassphrase: { type: Boolean, default: false },
    // When true, only a logged-in user may reveal this secret.
    requireLogin: { type: Boolean, default: false },

    status: { type: String, enum: SECRET_STATUS, default: "active" },
    viewedAt: { type: Date, default: null },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Never leak the encrypted payload (or owner) to the client.
secretSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.owner;
    for (const field of CONTENT_FIELDS) delete ret[field];
    return ret;
  },
});

export type SecretDoc = InferSchemaType<typeof secretSchema>;

export const Secret = mongoose.model("Secret", secretSchema);
