import mongoose, { Schema, type InferSchemaType } from "mongoose";

// A transfer bundles one or more uploaded files behind a single share link.
//   active → expired (TTL passed; files wiped from disk, metadata kept)
export const TRANSFER_STATUS = ["active", "expired"] as const;
export type TransferStatus = (typeof TRANSFER_STATUS)[number];

// Allowed TTLs in seconds (1h / 1d / 7d / 30d); 7 days is the default.
export const TTL_OPTIONS = [3600, 86400, 604800, 2592000] as const;
export const DEFAULT_TTL = 604800;

const fileSchema = new Schema(
  {
    originalName: { type: String, required: true },
    storedName: { type: String, required: true }, // on-disk uuid filename
    size: { type: Number, required: true },
    mimeType: { type: String, default: "application/octet-stream" },
  },
  { _id: false }
);

const transferSchema = new Schema(
  {
    token: { type: String, required: true, unique: true, index: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    message: { type: String, default: "" },
    files: { type: [fileSchema], required: true },
    totalSize: { type: Number, required: true },

    // Passphrase gates the download (bcrypt hash — files themselves are stored
    // as-is on disk, so this is an access gate, not at-rest encryption).
    hasPassphrase: { type: Boolean, default: false },
    passphraseHash: { type: String, default: null },
    requireLogin: { type: Boolean, default: false },

    status: { type: String, enum: TRANSFER_STATUS, default: "active" },
    downloadCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// Never leak the passphrase hash, owner, or on-disk filenames to the client.
transferSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.owner;
    delete ret.passphraseHash;
    if (Array.isArray(ret.files)) {
      ret.files = (ret.files as { originalName: string; size: number }[]).map(
        (f) => ({ name: f.originalName, size: f.size })
      );
    }
    return ret;
  },
});

export type TransferDoc = InferSchemaType<typeof transferSchema>;

export const Transfer = mongoose.model("Transfer", transferSchema);
