import type { RequestHandler } from "express";
import { isValidObjectId } from "mongoose";
import { AppError } from "../errors/AppError.js";
import { User } from "../models/User.js";

// GET /api/admin/users — list all accounts.
export const listUsers: RequestHandler = async (_req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

// POST /api/admin/users — admin creates a new account. The user must change
// their password on first login (mustChangePassword defaults to true).
export const createUser: RequestHandler = async (req, res, next) => {
  try {
    // Shape (email format, password length, role enum) is validated by
    // createUserSchema; here we only enforce uniqueness + persistence.
    const { email, password, role } = req.body;

    if (await User.exists({ email })) {
      throw new AppError("EMAIL_TAKEN", 409);
    }

    const user = await User.create({
      email,
      passwordHash: await User.hashPassword(password),
      role,
      mustChangePassword: true,
    });

    res.status(201).json({ user });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/admin/users/:id — remove an account (admins can't delete themselves).
export const deleteUser: RequestHandler = async (req, res, next) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      throw new AppError("USER_NOT_FOUND", 404);
    }
    if (req.params.id === req.user!.id) {
      throw new AppError("CANNOT_DELETE_SELF", 400);
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError("USER_NOT_FOUND", 404);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
