// Client-side validation for creating a one-time secret. Messages are i18n keys.
import { z } from "zod";

export const createSecretSchema = z.object({
  content: z.string().trim().min(1, "validation.contentRequired"),
  passphrase: z.string().optional(),
  ttlSeconds: z.number().int().positive(),
  requireLogin: z.boolean(),
});
export type CreateSecretFormInput = z.infer<typeof createSecretSchema>;
