import { z } from "zod";
import { boolish, optionalPositiveInt } from "./common.js";

// Multipart body fields (the files themselves are handled by multer). Kept
// permissive/non-rejecting so a valid upload is never discarded after multer
// has already written it to disk — the service trims/whitelists further.
export const createTransferSchema = z.object({
  message: z.string().optional(),
  passphrase: z.string().optional(),
  ttlSeconds: optionalPositiveInt,
  requireLogin: boolish,
});

export const verifyTransferSchema = z.object({
  passphrase: z.string().optional(),
});
