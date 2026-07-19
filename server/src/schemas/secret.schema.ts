import { z } from "zod";
import { boolish, optionalPositiveInt } from "./common.js";

// 100 KB of text — mirrors MAX_CONTENT_LENGTH in secret.service.
export const createSecretSchema = z.object({
  content: z
    .string()
    .min(1, "Content can't be empty.")
    .max(100_000, "Content is too large (max 100 KB)."),
  passphrase: z.string().optional(),
  ttlSeconds: optionalPositiveInt,
  requireLogin: boolish,
});

export const revealSecretSchema = z.object({
  passphrase: z.string().optional(),
});

export type CreateSecretInput = z.infer<typeof createSecretSchema>;
