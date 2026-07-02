import { useState } from "react";
import type { Job } from "../types";
import { MAX_CONCURRENCY } from "../types";
import { downloadZip } from "../utils/zip";
import { useI18n } from "../i18n";

interface Props {
  jobs: Job[];
  running: boolean;
  done: number;
  total: number;
  runLabel: string;
  zipName?: string;
  onRun: () => void;
  onClear: () => void;
}

export function BatchToolbar({
  jobs,
  running,
  done,
  total,
  runLabel,
  zipName,
  onRun,
  onClear,
}: Props) {
  const [zipping, setZipping] = useState(false);
  const { t } = useI18n();

  if (!total) return null;

  const pct = total ? Math.round((done / total) * 100) : 0;

  async function handleZip() {
    setZipping(true);
    try {
      await downloadZip(jobs, zipName);
    } finally {
      setZipping(false);
    }
  }

  return (
    <div className="batch-toolbar">
      <div className="batch-progress">
        <div className="batch-bar">
          <div className="batch-bar-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="batch-count">
          {t("toolbar.progress", { done, total })}
          {running && t("toolbar.parallel", { n: MAX_CONCURRENCY })}
        </span>
      </div>

      <div className="batch-actions">
        <button className="convert-btn" onClick={onRun} disabled={running}>
          {running ? t("toolbar.running") : runLabel}
        </button>
        {done > 0 && (
          <button className="ghost-btn" onClick={handleZip} disabled={zipping}>
            {zipping ? t("toolbar.zipping") : t("toolbar.zip", { n: done })}
          </button>
        )}
        <button className="ghost-btn" onClick={onClear} disabled={running}>
          {t("toolbar.clear")}
        </button>
      </div>
    </div>
  );
}
