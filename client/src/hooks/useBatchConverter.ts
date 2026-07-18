import { useCallback, useEffect, useRef, useState } from "react";
import { runWithConcurrency } from "@/utils/pool";
import type { Result } from "@/services/result";
import { MAX_CONCURRENCY, type ConvertResult, type Job } from "@/types";

let counter = 0;
function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `job-${Date.now()}-${counter++}`;
}

type ConvertFn<TOptions> = (
  file: File,
  options: TOptions
) => Promise<Result<ConvertResult>>;

// Generic hook that manages multi-file conversion.
// Each file is a "job"; jobs run up to MAX_CONCURRENCY in parallel,
// the rest wait in the queue.
export function useBatchConverter<TOptions>(
  convertFn: ConvertFn<TOptions>,
  validate?: (file: File) => string | null
) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mirror ref so runWithConcurrency can read the current list.
  const jobsRef = useRef<Job[]>([]);
  jobsRef.current = jobs;

  const patchJob = useCallback((id: string, patch: Partial<Job>) => {
    setJobs((prev) =>
      prev.map((j) => (j.id === id ? { ...j, ...patch } : j))
    );
  }, []);

  const addFiles = useCallback(
    (files: FileList | File[]) => {
      const arr = Array.from(files);
      const accepted: Job[] = [];
      for (const file of arr) {
        const err = validate?.(file);
        if (err) {
          setError(err);
          continue;
        }
        accepted.push({ id: newId(), file, status: "queued" });
      }
      if (accepted.length) {
        setError(null);
        setJobs((prev) => [...prev, ...accepted]);
      }
    },
    [validate]
  );

  const removeJob = useCallback((id: string) => {
    setJobs((prev) => {
      const target = prev.find((j) => j.id === id);
      if (target?.result) URL.revokeObjectURL(target.result.url);
      return prev.filter((j) => j.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setJobs((prev) => {
      prev.forEach((j) => j.result && URL.revokeObjectURL(j.result.url));
      return [];
    });
    setError(null);
  }, []);

  const run = useCallback(
    async (options: TOptions) => {
      // To process: jobs not yet completed.
      const targets = jobsRef.current.filter((j) => j.status !== "done");
      if (!targets.length) return;

      setRunning(true);
      // Queue them all (clear previous errors).
      setJobs((prev) =>
        prev.map((j) =>
          j.status !== "done"
            ? { ...j, status: "queued", error: undefined, errorCode: undefined, result: undefined }
            : j
        )
      );

      await runWithConcurrency(targets, MAX_CONCURRENCY, async (job) => {
        patchJob(job.id, { status: "processing" });
        const result = await convertFn(job.file, options);
        if (result.success) {
          patchJob(job.id, { status: "done", result: result.data });
        } else {
          patchJob(job.id, {
            status: "error",
            error: result.error,
            errorCode: result.code,
          });
        }
      });

      setRunning(false);
    },
    [convertFn, patchJob]
  );

  // Revoke all object URLs on unmount.
  useEffect(() => {
    return () => {
      jobsRef.current.forEach(
        (j) => j.result && URL.revokeObjectURL(j.result.url)
      );
    };
  }, []);

  const done = jobs.filter((j) => j.status === "done").length;
  const total = jobs.length;

  return {
    jobs,
    running,
    error,
    done,
    total,
    addFiles,
    removeJob,
    clear,
    run,
  };
}
