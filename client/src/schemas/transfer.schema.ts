// Client-side validation for creating a file transfer. Messages are i18n keys.
import { z } from "zod";

export const createTransferSchema = z.object({
  files: z.array(z.instanceof(File)).min(1, "validation.filesRequired"),
  message: z.string().optional(),
  passphrase: z.string().optional(),
  ttlSeconds: z.number().int().positive(),
  requireLogin: z.boolean(),
});
export type CreateTransferFormInput = z.infer<typeof createTransferSchema>;
