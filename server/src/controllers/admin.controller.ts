import type { RequestHandler } from "express";
import { AppError } from "../utils/AppError.js";
import { User, ROLES, type Role } from "../models/User.js";

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
    const email = String(req.body?.email ?? "").toLowerCase().trim();
    const password = String(req.body?.password ?? "");
    const role = (req.body?.role ?? "user") as Role;

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new AppError("Geçerli bir e-posta girin.", 400);
    }
    if (password.length < 8) {
      throw new AppError("Şifre en az 8 karakter olmalı.", 400);
    }
    if (!ROLES.includes(role)) {
      throw new AppError("Geçersiz rol.", 400);
    }
    if (await User.exists({ email })) {
      throw new AppError("Bu e-posta zaten kayıtlı.", 409);
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
    if (req.params.id === req.user!.id) {
      throw new AppError("Kendi hesabınızı silemezsiniz.", 400);
    }
    const deleted = await User.findByIdAndDelete(req.params.id);
    if (!deleted) throw new AppError("Kullanıcı bulunamadı.", 404);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
