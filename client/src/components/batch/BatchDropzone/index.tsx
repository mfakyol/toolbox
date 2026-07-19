import { Dropzone, DropzoneHint } from "@/components/ui";

interface Props {
  accept: string;
  hintTitle: string;
  hintSub: string;
  onFiles: (files: FileList | File[]) => void;
}

// Drag & drop area for selecting multiple files. Selected files are queued.
export function BatchDropzone({ accept, hintTitle, hintSub, onFiles }: Props) {
  return (
    <Dropzone onFiles={onFiles} accept={accept} multiple compact>
      <DropzoneHint icon="⬆️" title={hintTitle} sub={hintSub} />
    </Dropzone>
  );
}
