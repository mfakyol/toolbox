import { z } from "zod";
import { ROLES } from "../models/User.js";
import { emailString } from "./common.js";

export const createUserSchema = z.object({
  email: emailString,
  password: z.string().min(8, "Password must be at least 8 characters."),
  role: z.enum(ROLES).default("user"),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
