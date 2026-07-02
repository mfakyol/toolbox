import { useEffect, useState } from "react";
import type { Job, JobStatus } from "../types";
import { formatBytes } from "../utils/format";
import { useI18n } from "../i18n";

const STATUS_KEY: Record<JobStatus, string> = {
  queued: "job.queued",
  processing: "job.processing",
  done: "job.done",
  error: "job.error",
};

// Small thumbnail for image files; manages its object URL within its own lifecycle.
function Thumbnail({ file }: { file: File }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  return url ? <img className="job-thumb" src={url} alt="" /> : (
    <div className="job-thumb placeholder" />
  );
}

interface RowProps {
  job: Job;
  showThumb: boolean;
  onRemove: (id: string) => void;
  onCompare?: (job: Job) => void;
}

function JobRow({ job, showThumb, onRemove, onCompare }: RowProps) {
  const { file, status, result, error } = job;
  const good = result ? result.savings >= 0 : true;
  const { t } = useI18n();

  return (
    <div className={`job-row status-${status}`}>
      {showThumb ? (
        <Thumbnail file={file} />
      ) : (
        <div className="job-thumb placeholder">🔤</div>
      )}

      <div className="job-info">
        <span className="job-name" title={file.name}>
          {file.name}
        </span>
        <span className="job-sub">
          {result ? (
            <>
              {formatBytes(result.originalSize)} → {formatBytes(result.outputSize)}
              <em className={`savings-inline ${good ? "good" : "bad"}`}>
                {good ? "−" : "+"}
                {Math.abs(result.savings)}%
              </em>
              {result.meta && <> · {result.meta}</>}
            </>
          ) : error ? (
            <span className="job-error">{error}</span>
          ) : (
            formatBytes(file.size)
          )}
        </span>
      </div>

      <span className={`badge badge-${status}`}>{t(STATUS_KEY[status])}</span>

      {result && onCompare && (
        <button
          className="job-download"
          onClick={() => onCompare(job)}
          title={t("job.compare")}
          type="button"
        >
          🔍
        </button>
      )}

      {result && (
        <a
          className="job-download"
          href={result.url}
          download={result.filename}
          title={t("job.download")}
        >
          ⬇️
        </a>
      )}

      <button
        className="job-remove"
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
    <div className="job-list">
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
