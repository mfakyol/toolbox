import { useRef, useState, type DragEvent } from "react";

interface Props {
  accept: string;
  hintTitle: string;
  hintSub: string;
  onFiles: (files: FileList | File[]) => void;
}

// Drag & drop area for selecting multiple files. Selected files are queued.
export function BatchDropzone({ accept, hintTitle, hintSub, onFiles }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files?.length) onFiles(e.dataTransfer.files);
  }

  return (
    <div
      className={`dropzone compact ${dragging ? "dragging" : ""}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
    >
      <div className="dropzone-hint">
        <div className="icon">⬆️</div>
        <p>{hintTitle}</p>
        <span>{hintSub}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files?.length) onFiles(e.target.files);
          e.target.value = ""; // reset so the same file can be selected again
        }}
      />
    </div>
  );
}
