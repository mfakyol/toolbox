// Client-side validation for the auth forms. Messages are i18n keys — the page
// resolves the first issue's message through `t()` so copy stays translated.
import { z } from "zod";

export const loginSchema = z.object({
  email: z.email("validation.emailInvalid"),
  password: z.string().min(1, "validation.required"),
  rememberMe: z.boolean(),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const changePasswordSchema = z
  .object({
    current: z.string().min(1, "validation.required"),
    next: z.string().min(8, "auth.passwordTooShort"),
    confirm: z.string().min(1, "validation.required"),
  })
  .refine((d) => d.next === d.confirm, {
    message: "auth.passwordMismatch",
    path: ["confirm"],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createUserSchema = z.object({
  email: z.email("validation.emailInvalid"),
  password: z.string().min(8, "auth.passwordTooShort"),
  role: z.enum(["admin", "user"]),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;
