import JSZip from "jszip";
import type { Job } from "@/types";

// Packs the outputs of completed jobs into a single ZIP and downloads it.
export async function downloadZip(
  jobs: Job[],
  zipName = "converted.zip"
): Promise<void> {
  const done = jobs.filter((j) => j.result);
  if (!done.length) return;

  const zip = new JSZip();
  const used = new Map<string, number>();

  for (const job of done) {
    const { filename, blob } = job.result!;
    // If the same name appears more than once, append "-1", "-2".
    let name = filename;
    const count = used.get(filename) ?? 0;
    if (count > 0) {
      const dot = filename.lastIndexOf(".");
      name =
        dot === -1
          ? `${filename}-${count}`
          : `${filename.slice(0, dot)}-${count}${filename.slice(dot)}`;
    }
    used.set(filename, count + 1);
    zip.file(name, blob);
  }

  const archive = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(archive);
  const a = document.createElement("a");
  a.href = url;
  a.download = zipName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
