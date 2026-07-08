import type { RequestHandler } from "express";
import { ZipArchive } from "archiver";
import * as transferService from "../services/transfer.service.js";
import { storedFilePath } from "../middleware/uploadTransfer.js";

// POST /api/transfers — multipart upload of one or more files (requires login).
export const create: RequestHandler = async (req, res, next) => {
  try {
    const transfer = await transferService.createTransfer(
      req.user!.id,
      (req.files as Express.Multer.File[]) ?? [],
      {
        message: req.body?.message,
        passphrase: req.body?.passphrase,
        ttlSeconds: Number(req.body?.ttlSeconds) || undefined,
        requireLogin: req.body?.requireLogin === "true" || req.body?.requireLogin === true,
      }
    );
    res.status(201).json({ transfer });
  } catch (err) {
    next(err);
  }
};

// GET /api/transfers — current user's transfers (metadata only).
export const list: RequestHandler = async (req, res, next) => {
  try {
    const transfers = await transferService.listByOwner(req.user!.id);
    res.json({ transfers });
  } catch (err) {
    next(err);
  }
};

// GET /api/transfers/:token/meta — public download-page info (no file paths).
export const meta: RequestHandler = async (req, res, next) => {
  try {
    const transfer = await transferService.getMeta(req.params.token);
    if (!transfer) {
      res.status(404).json({ error: "Transfer bulunamadı." });
      return;
    }
    res.json({ transfer });
  } catch (err) {
    next(err);
  }
};

// POST /api/transfers/:token/verify — checks access (login + passphrase)
// without streaming, so the client can validate before a native download.
export const verify: RequestHandler = async (req, res, next) => {
  try {
    await transferService.authorizeDownload(req.params.token, {
      passphrase: req.body?.passphrase,
      isAuthed: Boolean(req.isAuthenticated?.() && req.user),
    });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};

// GET /api/transfers/:token/download — streams the file (or a zip of files).
// Passphrase (if any) is passed as a query param so the browser can download
// natively without buffering large files in memory.
export const download: RequestHandler = async (req, res, next) => {
  try {
    const transfer = await transferService.authorizeDownload(req.params.token, {
      passphrase: typeof req.query.passphrase === "string" ? req.query.passphrase : "",
      isAuthed: Boolean(req.isAuthenticated?.() && req.user),
    });

    await transferService.incrementDownload((transfer as { _id: unknown })._id);

    // Single file → stream it directly under its original name.
    if (transfer.files.length === 1) {
      const file = transfer.files[0];
      res.download(storedFilePath(file.storedName), file.originalName);
      return;
    }

    // Multiple files → stream a zip built on the fly.
    res.attachment(`transfer-${transfer.token}.zip`);
    const archive = new ZipArchive({ zlib: { level: 5 } });
    archive.on("error", (err: Error) => next(err));
    archive.pipe(res);
    for (const file of transfer.files) {
      archive.file(storedFilePath(file.storedName), { name: file.originalName });
    }
    await archive.finalize();
  } catch (err) {
    next(err);
  }
};

// DELETE /api/transfers/:id — owner removes a transfer and its files.
export const remove: RequestHandler = async (req, res, next) => {
  try {
    await transferService.deleteTransfer(req.user!.id, req.params.id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
