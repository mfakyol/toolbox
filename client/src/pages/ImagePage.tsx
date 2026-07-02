import { useCallback, useEffect, useState } from "react";
import { getImageDimensions, type Dims } from "../utils/imageDims";
import { BatchDropzone } from "../components/BatchDropzone";
import { Controls } from "../components/Controls";
import { JobList } from "../components/JobList";
import { BatchToolbar } from "../components/BatchToolbar";
import { CompareModal } from "../components/CompareModal";
import { useBatchConverter } from "../hooks/useBatchConverter";
import { convertImage } from "../api/convert";
import { useI18n } from "../i18n";
import type { ImageConvertOptions, ImageFormat, Job } from "../types";

export default function ImagePage() {
  const { t } = useI18n();
  const [format, setFormat] = useState<ImageFormat>("webp");
  const [quality, setQuality] = useState(80);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [keepMetadata, setKeepMetadata] = useState(false);

  const [compareJob, setCompareJob] = useState<Job | null>(null);
  const [originalDims, setOriginalDims] = useState<Dims | null>(null);

  const validateImage = useCallback(
    (file: File): string | null =>
      file.type.startsWith("image/")
        ? null
        : t("image.notImage", { name: file.name }),
    [t]
  );

  const batch = useBatchConverter(convertImage, validateImage);

  // Read the first uploaded image's original size (hint for the size fields).
  const firstFile = batch.jobs[0]?.file;
  useEffect(() => {
    let cancelled = false;
    if (!firstFile) {
      setOriginalDims(null);
      return;
    }
    getImageDimensions(firstFile).then((d) => {
      if (!cancelled) setOriginalDims(d);
    });
    return () => {
      cancelled = true;
    };
  }, [firstFile]);

  const handleRun = useCallback(() => {
    const opts: ImageConvertOptions = {
      format,
      quality,
      width: width ? Number(width) : undefined,
      height: height ? Number(height) : undefined,
      keepMetadata,
    };
    void batch.run(opts);
  }, [batch, format, quality, width, height, keepMetadata]);

  return (
    <>
      <p className="page-intro">{t("image.intro")}</p>

      <div className="layout">
        <section className="panel">
          <BatchDropzone
            accept="image/*"
            hintTitle={t("image.dropTitle")}
            hintSub={t("image.dropSub")}
            onFiles={batch.addFiles}
          />
          {batch.error && <div className="error">⚠️ {batch.error}</div>}
          <JobList
            jobs={batch.jobs}
            showThumb
            onRemove={batch.removeJob}
            onCompare={setCompareJob}
          />
        </section>

        <section className="panel controls">
          <Controls
            format={format}
            quality={quality}
            width={width}
            height={height}
            keepMetadata={keepMetadata}
            onFormat={setFormat}
            onQuality={setQuality}
            onWidth={setWidth}
            onHeight={setHeight}
            onKeepMetadata={setKeepMetadata}
            originalDims={originalDims}
            multiple={batch.jobs.length > 1}
          />
          <BatchToolbar
            jobs={batch.jobs}
            running={batch.running}
            done={batch.done}
            total={batch.total}
            runLabel={t("image.run")}
            zipName="optimized-images.zip"
            onRun={handleRun}
            onClear={batch.clear}
          />
        </section>
      </div>

      {compareJob && (
        <CompareModal job={compareJob} onClose={() => setCompareJob(null)} />
      )}
    </>
  );
}
