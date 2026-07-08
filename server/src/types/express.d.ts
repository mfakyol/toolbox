import type { HydratedDocument } from "mongoose";
import type { Role } from "../models/User.js";

// Shape of the authenticated user attached to the request by passport.
interface AuthUser {
  id: string;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  passwordHash: string;
}

declare global {
  namespace Express {
    // Passport's req.user. Mongoose documents satisfy this shape.
    interface User extends AuthUser {}
  }
}

export {};
