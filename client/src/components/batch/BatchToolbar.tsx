import { useState } from "react";
import type { Job } from "@/types";
import { MAX_CONCURRENCY } from "@/types";
import { downloadZip } from "@/utils/zip";
import { useI18n } from "@/i18n";
import { Button, Progress } from "@/components/ui";
import styles from "./BatchToolbar.module.scss";

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
    <div className={styles.toolbar}>
      <div className={styles.progress}>
        <Progress value={pct} />
        <span className={styles.count}>
          {t("toolbar.progress", { done, total })}
          {running && t("toolbar.parallel", { n: MAX_CONCURRENCY })}
        </span>
      </div>

      <div className={styles.actions}>
        <Button block onClick={onRun} disabled={running}>
          {running ? t("toolbar.running") : runLabel}
        </Button>
        {done > 0 && (
          <Button variant="ghost" block onClick={handleZip} disabled={zipping}>
            {zipping ? t("toolbar.zipping") : t("toolbar.zip", { n: done })}
          </Button>
        )}
        <Button variant="ghost" block onClick={onClear} disabled={running}>
          {t("toolbar.clear")}
        </Button>
      </div>
    </div>
  );
}
