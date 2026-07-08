import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose";
import bcrypt from "bcryptjs";

// User roles. More admin-level roles may be added later.
export const ROLES = ["admin", "user"] as const;
export type Role = (typeof ROLES)[number];

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "user", required: true },
    // Accounts created by an admin must change their password on first login.
    mustChangePassword: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Never leak the password hash when a user is serialized to JSON.
userSchema.set("toJSON", {
  transform(_doc, ret: Record<string, unknown>) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.passwordHash;
    return ret;
  },
});

type UserDoc = InferSchemaType<typeof userSchema>;

export interface UserModel extends Model<UserDoc> {
  hashPassword(plain: string): Promise<string>;
}

userSchema.static("hashPassword", function hashPassword(plain: string) {
  return bcrypt.hash(plain, 12);
});

export function verifyPassword(
  plain: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export const User = mongoose.model<UserDoc, UserModel>("User", userSchema);
