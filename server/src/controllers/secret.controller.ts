import type { RequestHandler } from "express";
import * as secretService from "../services/secret.service.js";
import { ownerId } from "../config/index.js";

// POST /api/secrets — create a one-time secret (login required unless auth is
// disabled, in which case it belongs to the shared anonymous owner).
export const create: RequestHandler = async (req, res, next) => {
  try {
    const secret = await secretService.createSecret(ownerId(req), {
      content: req.body?.content,
      passphrase: req.body?.passphrase,
      ttlSeconds: Number(req.body?.ttlSeconds) || undefined,
      requireLogin: Boolean(req.body?.requireLogin),
    });
    res.status(201).json({ secret });
  } catch (err) {
    next(err);
  }
};

// GET /api/secrets — the current user's secrets (metadata only).
export const list: RequestHandler = async (req, res, next) => {
  try {
    const secrets = await secretService.listByOwner(ownerId(req));
    res.json({ secrets });
  } catch (err) {
    next(err);
  }
};

// GET /api/secrets/:token/meta — public info for the view page (no content).
export const meta: RequestHandler = async (req, res, next) => {
  try {
    const info = await secretService.getMeta(req.params.token);
    if (!info) {
      res.status(404).json({ error: "Sır bulunamadı." });
      return;
    }
    res.json({ meta: info });
  } catch (err) {
    next(err);
  }
};

// POST /api/secrets/:token/reveal — one-time reveal; deletes content after.
export const reveal: RequestHandler = async (req, res, next) => {
  try {
    const content = await secretService.revealSecret(req.params.token, {
      passphrase: req.body?.passphrase,
      isAuthed: Boolean(req.isAuthenticated?.() && req.user),
    });
    res.json({ content });
  } catch (err) {
    next(err);
  }
};
