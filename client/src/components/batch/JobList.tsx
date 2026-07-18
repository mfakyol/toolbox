import { useEffect, useState } from "react";
import type { Job, JobStatus } from "@/types";
import { formatBytes } from "@/utils/format";
import { useI18n } from "@/i18n";
import { Badge, type BadgeTone } from "@/components/ui";
import styles from "./JobList.module.scss";

const STATUS_KEY: Record<JobStatus, string> = {
  queued: "job.queued",
  processing: "job.processing",
  done: "job.done",
  error: "job.error",
};

const STATUS_TONE: Record<JobStatus, BadgeTone> = {
  queued: "neutral",
  processing: "accent",
  done: "success",
  error: "danger",
};

// Small thumbnail for image files; manages its object URL within its own lifecycle.
function Thumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return url ? (
    <img className={styles.thumb} src={url} alt="" />
  ) : (
    <div className={`${styles.thumb} ${styles.placeholder}`} />
  );
}

interface RowProps {
  job: Job;
  showThumb: boolean;
  onRemove: (id: string) => void;
  onCompare?: (job: Job) => void;
}

function JobRow({ job, showThumb, onRemove, onCompare }: RowProps) {
  const { file, status, result, error, errorCode } = job;
  const good = result ? result.savings >= 0 : true;
  const { t, te } = useI18n();

  const rowCls = [
    styles.row,
    status === "error" && styles.rowError,
    status === "done" && styles.rowDone,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={rowCls}>
      {showThumb ? (
        <Thumbnail file={file} />
      ) : (
        <div className={`${styles.thumb} ${styles.placeholder}`}>🔤</div>
      )}

      <div className={styles.info}>
        <span className={styles.name} title={file.name}>
          {file.name}
        </span>
        <span className={styles.sub}>
          {result ? (
            <>
              {formatBytes(result.originalSize)} → {formatBytes(result.outputSize)}
              <em
                className={`${styles.savings} ${good ? styles.good : styles.bad}`}
              >
                {good ? "−" : "+"}
                {Math.abs(result.savings)}%
              </em>
              {result.meta && <> · {result.meta}</>}
            </>
          ) : error ? (
            <span className={styles.error}>{te(errorCode, error)}</span>
          ) : (
            formatBytes(file.size)
          )}
        </span>
      </div>

      <Badge tone={STATUS_TONE[status]}>{t(STATUS_KEY[status])}</Badge>

      {result && onCompare && (
        <button
          className={styles.iconBtn}
          onClick={() => onCompare(job)}
          title={t("job.compare")}
          type="button"
        >
          🔍
        </button>
      )}

      {result && (
        <a
          className={styles.iconBtn}
          href={result.url}
          download={result.filename}
          title={t("job.download")}
        >
          ⬇️
        </a>
      )}

      <button
        className={`${styles.iconBtn} ${styles.removeBtn}`}
        onClick={() => onRemove(job.id)}
        title={t("job.remove")}
        type="button"
      >
        ✕
      </button>
    </div>
  );
}

interface Props {
  jobs: Job[];
  showThumb: boolean;
  onRemove: (id: string) => void;
  onCompare?: (job: Job) => void;
}

export function JobList({ jobs, showThumb, onRemove, onCompare }: Props) {
  if (!jobs.length) return null;
  return (
    <div className={styles.list}>
      {jobs.map((job) => (
        <JobRow
          key={job.id}
          job={job}
          showThumb={showThumb}
          onRemove={onRemove}
          onCompare={onCompare}
        />
      ))}
    </div>
  );
}
