import { useEffect, useState } from "react";
import type { Job } from "../types";
import { CompareSlider } from "./CompareSlider";
import { formatBytes } from "../utils/format";
import { useI18n } from "../i18n";

interface Props {
  job: Job;
  onClose: () => void;
}

// Before/after comparison modal for an image job.
// Manages the original image's object URL within its own lifecycle.
export function CompareModal({ job, onClose }: Props) {
  const [beforeUrl, setBeforeUrl] = useState<string | null>(null);
  const { t } = useI18n();

  useEffect(() => {
    const u = URL.createObjectURL(job.file);
    setBeforeUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [job.file]);

  // ESC ile kapat.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const result = job.result;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <span className="modal-title" title={job.file.name}>
            {job.file.name}
          </span>
          <button className="modal-close" onClick={onClose} type="button">
            ✕
          </button>
        </div>

        {beforeUrl && result && (
          <CompareSlider
            beforeUrl={beforeUrl}
            afterUrl={result.url}
            beforeLabel={`${t("compare.before")} · ${formatBytes(
              result.originalSize
            )}`}
            afterLabel={`${t("compare.after")} · ${formatBytes(
              result.outputSize
            )}`}
          />
        )}

        <p className="modal-foot">
          {t("compare.hint")}
          {result?.meta && ` · ${result.meta}`}
        </p>
      </div>
    </div>
  );
}
