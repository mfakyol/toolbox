// File-transfer API client. Uploads use XHR for progress; downloads use a
// native browser navigation so large files aren't buffered in memory.

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

async function api<T>(url: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(url, { credentials: "include", ...options });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    const err = new Error(data.error || `Sunucu hatası (${res.status})`) as Error & {
      status?: number;
    };
    err.status = res.status;
    throw err;
  }
  return res.json() as Promise<T>;
}

// Uploads via XHR so we can report progress (0–100).
export function createTransfer(
  input: CreateTransferInput,
  onProgress?: (percent: number) => void
): Promise<{ transfer: TransferSummary }> {
  const fd = new FormData();
  input.files.forEach((f) => fd.append("files", f));
  if (input.message) fd.append("message", input.message);
  if (input.passphrase) fd.append("passphrase", input.passphrase);
  fd.append("ttlSeconds", String(input.ttlSeconds));
  fd.append("requireLogin", String(input.requireLogin));

  return new Promise((resolve, reject) => {
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
        resolve(data as { transfer: TransferSummary });
      } else {
        reject(
          new Error(
            (data as { error?: string }).error || `Sunucu hatası (${xhr.status})`
          )
        );
      }
    };
    xhr.onerror = () => reject(new Error("Ağ hatası."));
    xhr.send(fd);
  });
}

export function listTransfers(): Promise<{ transfers: TransferSummary[] }> {
  return api("/api/transfers");
}

export function getTransferMeta(
  token: string
): Promise<{ transfer: TransferSummary }> {
  return api(`/api/transfers/${encodeURIComponent(token)}/meta`);
}

// Validates access (login + passphrase) before triggering a native download.
export function verifyTransfer(
  token: string,
  passphrase?: string
): Promise<{ ok: boolean }> {
  return api(`/api/transfers/${encodeURIComponent(token)}/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ passphrase }),
  });
}

export function deleteTransfer(id: string): Promise<{ ok: boolean }> {
  return api(`/api/transfers/${encodeURIComponent(id)}`, { method: "DELETE" });
}

// Shareable page URL (not the raw download).
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
