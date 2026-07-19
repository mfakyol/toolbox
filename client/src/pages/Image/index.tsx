import { useCallback, useEffect, useState } from "react";
import { getImageDimensions, type Dims } from "@/utils/imageDims";
import { BatchDropzone } from "@/components/batch/BatchDropzone";
import { Controls } from "@/components/batch/Controls";
import { JobList } from "@/components/batch/JobList";
import { BatchToolbar } from "@/components/batch/BatchToolbar";
import { CompareModal } from "@/components/compare/CompareModal";
import { useBatchConverter } from "@/hooks/useBatchConverter";
import { convertImage } from "@/services/convert.service";
import { useI18n } from "@/i18n";
import type { ImageConvertOptions, ImageFormat, Job } from "@/types";
import { PageIntro, Columns, Panel, Alert } from "@/components/ui";
import styles from "./styles.module.scss";

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
      <PageIntro>{t("image.intro")}</PageIntro>

      <Columns>
        <Panel>
          <BatchDropzone
            accept="image/*"
            hintTitle={t("image.dropTitle")}
            hintSub={t("image.dropSub")}
            onFiles={batch.addFiles}
          />
          {batch.error && <Alert>⚠️ {batch.error}</Alert>}
          <JobList
            jobs={batch.jobs}
            showThumb
            onRemove={batch.removeJob}
            onCompare={setCompareJob}
          />
        </Panel>

        <Panel className={styles.controls}>
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
        </Panel>
      </Columns>

      {compareJob && (
        <CompareModal job={compareJob} onClose={() => setCompareJob(null)} />
      )}
    </>
  );
}
