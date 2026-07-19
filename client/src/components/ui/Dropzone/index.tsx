import {
  useRef,
  useState,
  type DragEvent,
  type ImgHTMLAttributes,
  type ReactNode,
} from "react";
import styles from "./styles.module.scss";

interface DropzoneProps {
  onFiles: (files: FileList) => void;
  accept?: string;
  multiple?: boolean;
  hasPreview?: boolean;
  compact?: boolean;
  className?: string;
  children: ReactNode;
}

// Click-or-drop file input. Renders its children (a preview or a hint) inside.
export function Dropzone({
  onFiles,
  accept,
  multiple = false,
  hasPreview = false,
  compact = false,
  className,
  children,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  }

  const cls = [
    styles.zone,
    dragging && styles.dragging,
    hasPreview && styles.hasPreview,
    compact && styles.compact,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cls}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      {children}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = "";
        }}
      />
    </div>
  );
}

// Empty-state prompt shown inside a Dropzone.
export function DropzoneHint({
  icon,
  title,
  sub,
}: {
  icon: ReactNode;
  title: ReactNode;
  sub?: ReactNode;
}) {
  return (
    <div className={styles.hint}>
      <div className={styles.icon}>{icon}</div>
      <p className={styles.title}>{title}</p>
      {sub != null && <span className={styles.sub}>{sub}</span>}
    </div>
  );
}

// Image preview styled to fit inside a Dropzone.
export function DropzonePreview(props: ImgHTMLAttributes<HTMLImageElement>) {
  return <img alt="" {...props} className={styles.preview} />;
}
