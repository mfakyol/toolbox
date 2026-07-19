// File-transfer business logic. Files live on disk; this module owns their
// lifecycle (create → serve → expire/delete) alongside the DB metadata.
import fs from "node:fs/promises";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { isValidObjectId } from "mongoose";
import { config } from "../config/index.js";
import { AppError } from "../errors/AppError.js";
import {
  Transfer,
  TTL_OPTIONS,
  DEFAULT_TTL,
  type TransferDoc,
} from "../models/Transfer.js";
import { storedFilePath } from "../utils/storage.js";

type UploadedFile = Express.Multer.File;
type TransferRow = TransferDoc & { _id: unknown };

// Best-effort removal of the on-disk files for a transfer.
async function deleteFilesFromDisk(files: { storedName: string }[]) {
  await Promise.all(
    files.map((f) =>
      fs.unlink(storedFilePath(f.storedName)).catch(() => {
        /* already gone — ignore */
      })
    )
  );
}

export interface CreateTransferInput {
  message?: string;
  passphrase?: string;
  ttlSeconds?: number;
  requireLogin?: boolean;
}

export async function createTransfer(
  ownerId: string,
  files: UploadedFile[],
  input: CreateTransferInput
) {
  if (!files || files.length === 0) {
    throw new AppError("TRANSFER_NO_FILES", 400);
  }

  const totalSize = files.reduce((sum, f) => sum + f.size, 0);
  if (totalSize > config.maxTransferSize) {
    // Over the total cap — clean up what multer already wrote.
    await deleteFilesFromDisk(files.map((f) => ({ storedName: f.filename })));
    throw new AppError("TRANSFER_TOO_LARGE", 413);
  }

  const ttlSeconds =
    input.ttlSeconds && TTL_OPTIONS.includes(input.ttlSeconds as never)
      ? input.ttlSeconds
      : DEFAULT_TTL;

  const passphrase = input.passphrase?.trim() || "";

  const transfer = await Transfer.create({
    token: crypto.randomBytes(18).toString("base64url"),
    owner: ownerId,
    message: input.message?.slice(0, 2000) ?? "",
    files: files.map((f) => ({
      originalName: f.originalname,
      storedName: f.filename,
      size: f.size,
      mimeType: f.mimetype,
    })),
    totalSize,
    hasPassphrase: passphrase.length > 0,
    passphraseHash: passphrase ? await bcrypt.hash(passphrase, 12) : null,
    requireLogin: Boolean(input.requireLogin),
    status: "active",
    expiresAt: new Date(Date.now() + ttlSeconds * 1000),
  });

  return transfer;
}

// Lazily expire an active transfer whose TTL has passed: wipe files, keep meta.
async function expireIfNeeded(transfer: TransferRow) {
  if (
    transfer.status === "active" &&
    transfer.expiresAt.getTime() <= Date.now()
  ) {
    await deleteFilesFromDisk(transfer.files);
    await Transfer.updateOne(
      { _id: transfer._id, status: "active" },
      { $set: { status: "expired" } }
    );
    transfer.status = "expired";
  }
  return transfer;
}

export async function listByOwner(ownerId: string) {
  const transfers = await Transfer.find({ owner: ownerId }).sort({
    createdAt: -1,
  });
  await Promise.all(transfers.map((t) => expireIfNeeded(t as never)));
  return transfers;
}

export async function getMeta(token: string) {
  const transfer = await Transfer.findOne({ token });
  if (!transfer) return null;
  await expireIfNeeded(transfer as never);
  return transfer;
}

export interface DownloadAuth {
  passphrase?: string;
  isAuthed: boolean;
}

// Verifies a caller may download, returning the doc (with on-disk file names).
// Throws on missing / expired / login-required / wrong-passphrase.
export async function authorizeDownload(token: string, auth: DownloadAuth) {
  const transfer = await Transfer.findOne({ token });
  if (!transfer) throw new AppError("TRANSFER_NOT_FOUND", 404);

  await expireIfNeeded(transfer as never);
  if (transfer.status === "expired") {
    throw new AppError("TRANSFER_EXPIRED", 410);
  }
  if (transfer.requireLogin && !auth.isAuthed) {
    throw new AppError("TRANSFER_LOGIN_REQUIRED", 401);
  }
  if (transfer.hasPassphrase) {
    const ok = await bcrypt.compare(
      auth.passphrase?.trim() || "",
      transfer.passphraseHash ?? ""
    );
    if (!ok) throw new AppError("TRANSFER_WRONG_PASSPHRASE", 403);
  }

  return transfer;
}

export async function incrementDownload(id: unknown) {
  await Transfer.updateOne({ _id: id }, { $inc: { downloadCount: 1 } });
}

export async function deleteTransfer(ownerId: string, id: string) {
  if (!isValidObjectId(id)) throw new AppError("TRANSFER_NOT_FOUND", 404);
  const transfer = await Transfer.findOne({ _id: id, owner: ownerId });
  if (!transfer) throw new AppError("TRANSFER_NOT_FOUND", 404);
  await deleteFilesFromDisk(transfer.files);
  await transfer.deleteOne();
}

// Background sweep: wipe files of any active transfer past its TTL.
export async function sweepExpiredTransfers() {
  const expired = await Transfer.find({
    status: "active",
    expiresAt: { $lte: new Date() },
  });
  for (const transfer of expired) {
    await deleteFilesFromDisk(transfer.files);
  }
  await Transfer.updateMany(
    { status: "active", expiresAt: { $lte: new Date() } },
    { $set: { status: "expired" } }
  );
}

export function startTransferSweeper(intervalMs = 60_000) {
  const timer = setInterval(() => {
    sweepExpiredTransfers().catch((err) =>
      console.error("Transfer sweep hatası:", err)
    );
  }, intervalMs);
  timer.unref?.();
  return timer;
}
