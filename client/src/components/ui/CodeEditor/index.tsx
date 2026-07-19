import { useMemo } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";
import type { Extension } from "@codemirror/state";

type Language = "json" | "typescript";

interface Props {
  value: string;
  language: Language;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  placeholder?: string;
  minHeight?: string;
}

// Syntax-highlighted code editor (CodeMirror + one-dark theme).
// Read-only when onChange is not provided.
export function CodeEditor({
  value,
  language,
  onChange,
  readOnly = false,
  placeholder,
  minHeight = "440px",
}: Props) {
  const extensions = useMemo<Extension[]>(
    () =>
      language === "json"
        ? [json()]
        : [javascript({ typescript: true })],
    [language]
  );

  return (
    <CodeMirror
      value={value}
      theme={oneDark}
      extensions={extensions}
      onChange={onChange}
      readOnly={readOnly}
      editable={!readOnly}
      placeholder={placeholder}
      minHeight={minHeight}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: !readOnly,
        highlightActiveLineGutter: !readOnly,
      }}
    />
  );
}
