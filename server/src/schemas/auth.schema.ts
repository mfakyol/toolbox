import { z } from "zod";
import { emailString, boolish } from "./common.js";

export const loginSchema = z.object({
  email: emailString,
  password: z.string().min(1, "Password is required."),
  rememberMe: boolish,
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required."),
  newPassword: z.string().min(8, "New password must be at least 8 characters."),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;
