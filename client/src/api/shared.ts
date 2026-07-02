import type { ConvertResult } from "../types";

// POSTs FormData; throws the backend message on error.
export async function postForm(url: string, fd: FormData): Promise<Response> {
  const res = await fetch(url, { method: "POST", body: fd });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || `Sunucu hatası (${res.status})`);
  }
  return res;
}

// Extracts common stats (size, savings, download name) from the response headers.
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
