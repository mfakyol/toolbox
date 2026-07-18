// File-transfer service. Uploads use XHR for progress; downloads use a native
// browser navigation so large files aren't buffered in memory.
import { type Result, ok, fail } from "./result";
import { requestJson } from "./http";

export type TransferStatus = "active" | "expired";

export interface TransferFile {
  name: string;
  size: number;
}

export interface TransferSummary {
  id: string;
  token: string;
  message: string;
  files: TransferFile[];
  totalSize: number;
  hasPassphrase: boolean;
  requireLogin: boolean;
  status: TransferStatus;
  downloadCount: number;
  expiresAt: string;
  createdAt: string;
}

export interface CreateTransferInput {
  files: File[];
  message?: string;
  passphrase?: string;
  ttlSeconds: number;
  requireLogin: boolean;
}

// Uploads via XHR so we can report progress (0–100). Resolves to a Result;
// it never rejects.
export function createTransfer(
  input: CreateTransferInput,
  onProgress?: (percent: number) => void
): Promise<Result<{ transfer: TransferSummary }>> {
  const fd = new FormData();
  input.files.forEach((f) => fd.append("files", f));
  if (input.message) fd.append("message", input.message);
  if (input.passphrase) fd.append("passphrase", input.passphrase);
  fd.append("ttlSeconds", String(input.ttlSeconds));
  fd.append("requireLogin", String(input.requireLogin));

  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/transfers");
    xhr.withCredentials = true;

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      let data: unknown = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* ignore */
      }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(ok(data as { transfer: TransferSummary }));
      } else {
        resolve(
          fail(
            (data as { error?: string }).error ||
              `Sunucu hatası (${xhr.status})`
          )
        );
      }
    };
    xhr.onerror = () => resolve(fail("Ağ hatası."));
    xhr.send(fd);
  });
}

export function listTransfers(): Promise<Result<{ transfers: TransferSummary[] }>> {
  return requestJson("/api/transfers");
}

export function getTransferMeta(
  token: string
): Promise<Result<{ transfer: TransferSummary }>> {
  return requestJson(`/api/transfers/${encodeURIComponent(token)}/meta`);
}

// Validates access (login + passphrase) before triggering a native download.
export function verifyTransfer(
  token: string,
  passphrase?: string
): Promise<Result<{ ok: boolean }>> {
  return requestJson(`/api/transfers/${encodeURIComponent(token)}/verify`, {
    method: "POST",
    body: JSON.stringify({ passphrase }),
  });
}

export function deleteTransfer(id: string): Promise<Result<{ ok: boolean }>> {
  return requestJson(`/api/transfers/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
}

// Shareable page URL (not the raw download; pure — no request).
export function transferShareUrl(token: string): string {
  return `${window.location.origin}/t/${token}`;
}

// Direct download URL; passphrase (if any) goes in the query for native GET.
export function transferDownloadUrl(token: string, passphrase?: string): string {
  const base = `/api/transfers/${encodeURIComponent(token)}/download`;
  return passphrase
    ? `${base}?passphrase=${encodeURIComponent(passphrase)}`
    : base;
}
