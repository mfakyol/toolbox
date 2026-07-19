import type { RequestHandler } from "express";
import passport from "passport";
import { config } from "../config/index.js";
import { AppError } from "../errors/AppError.js";
import { User, verifyPassword } from "../models/User.js";

// POST /api/auth/login — email + password, optional rememberMe.
export const login: RequestHandler = (req, res, next) => {
  passport.authenticate(
    "local",
    (err: unknown, user: Express.User | false, _info?: { message?: string }) => {
      if (err) return next(err);
      if (!user) {
        return next(new AppError("INVALID_CREDENTIALS", 401));
      }

      req.logIn(user, (loginErr) => {
        if (loginErr) return next(loginErr);

        // Remember me → persistent 1-year cookie; otherwise a session cookie
        // that expires when the browser closes.
        if (req.body.rememberMe) {
          req.session.cookie.maxAge = config.rememberMeMaxAge;
        } else {
          req.session.cookie.expires = undefined;
        }

        res.json({ user });
      });
    }
  )(req, res, next);
};

// POST /api/auth/logout
export const logout: RequestHandler = (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    req.session.destroy((destroyErr) => {
      if (destroyErr) return next(destroyErr);
      res.clearCookie("toolbox.sid");
      res.json({ ok: true });
    });
  });
};

// GET /api/auth/me — current session user (or null).
export const me: RequestHandler = (req, res) => {
  res.json({ user: req.isAuthenticated?.() ? req.user : null });
};

// POST /api/auth/change-password — current user changes their own password.
// Also clears the "must change password" flag set on admin-created accounts.
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    // Shape (currentPassword present, newPassword length) is validated by
    // changePasswordSchema.
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user!.id);
    if (!user) throw new AppError("USER_NOT_FOUND", 404);

    if (!(await verifyPassword(currentPassword ?? "", user.passwordHash))) {
      throw new AppError("CURRENT_PASSWORD_INCORRECT", 400);
    }

    user.passwordHash = await User.hashPassword(newPassword);
    user.mustChangePassword = false;
    await user.save();

    res.json({ user });
  } catch (err) {
    next(err);
  }
};
