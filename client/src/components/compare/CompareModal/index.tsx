import { useEffect, useState } from "react";
import type { Job } from "@/types";
import { CompareSlider } from "@/components/compare/CompareSlider";
import { formatBytes } from "@/utils/format";
import { useI18n } from "@/i18n";
import styles from "./styles.module.scss";

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
    <div className={styles.backdrop} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.head}>
          <span className={styles.title} title={job.file.name}>
            {job.file.name}
          </span>
          <button className={styles.close} onClick={onClose} type="button">
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

        <p className={styles.foot}>
          {t("compare.hint")}
          {result?.meta && ` · ${result.meta}`}
        </p>
      </div>
    </div>
  );
}
