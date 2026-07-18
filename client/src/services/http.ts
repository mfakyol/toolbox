// Shared HTTP helpers. Every request goes out with the session cookie and comes
// back as a `Result` — these never throw for HTTP or network errors.
import type { ConvertResult } from "@/types";
import { type Result, ok, fail } from "./result";

// JSON request → Result<T>.
export async function requestJson<T>(
  url: string,
  options: RequestInit = {}
): Promise<Result<T>> {
  try {
    const res = await fetch(url, {
      credentials: "include",
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers ?? {}) },
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return fail(data.error || `Server error (${res.status})`, data.code);
    }
    return ok((await res.json()) as T);
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err), "NETWORK");
  }
}

// Multipart POST → Result<Response> (the caller reads the body/headers/blob).
export async function postForm(
  url: string,
  fd: FormData
): Promise<Result<Response>> {
  try {
    const res = await fetch(url, {
      method: "POST",
      credentials: "include",
      body: fd,
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      return fail(data.error || `Server error (${res.status})`, data.code);
    }
    return ok(res);
  } catch (err) {
    return fail(err instanceof Error ? err.message : String(err), "NETWORK");
  }
}

// Extracts common stats (size, savings, download name) from a conversion response.
export async function computeStats(
  res: Response,
  file: File
): Promise<Omit<ConvertResult, "meta">> {
  const blob = await res.blob();
  const originalSize = Number(res.headers.get("X-Original-Size")) || file.size;
  const outputSize = Number(res.headers.get("X-Output-Size")) || blob.size;
  const disposition = res.headers.get("Content-Disposition") ?? "";
  const nameMatch = disposition.match(/filename="(.+?)"/);

  return {
    blob,
    url: URL.createObjectURL(blob),
    filename: nameMatch?.[1] ?? file.name,
    originalSize,
    outputSize,
    savings: originalSize
      ? Math.round((1 - outputSize / originalSize) * 100)
      : 0,
  };
}
