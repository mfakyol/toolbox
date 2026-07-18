import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { Field, Button, Alert, Segmented } from "@/components/ui";
import {
  base64Encode,
  base64Decode,
  decodeJwt,
  hashText,
  generateUuids,
  HASH_ALGOS,
  type HashAlgo,
} from "@/utils/devtools";
import { diffLines } from "@/utils/diff";
import styles from "./DevTools.module.scss";

// Shared: input → transform → output layout.
function IOArea(props: {
  inputLabel: string;
  outputLabel: string;
  input: string;
  output: string;
  error?: string | null;
  onInput: (v: string) => void;
  controls?: React.ReactNode;
}) {
  const { inputLabel, outputLabel, input, output, error, onInput, controls } =
    props;
  return (
    <div className={styles.io}>
      <Field label={inputLabel}>
        <textarea
          className={styles.codeArea}
          value={input}
          onChange={(e) => onInput(e.target.value)}
          spellCheck={false}
        />
      </Field>

      {controls && <div className={styles.controls}>{controls}</div>}

      <div className={styles.col}>
        <div className={`${styles.colHead} ${styles.between}`}>
          <span>{outputLabel}</span>
          <CopyButton text={output} />
        </div>
        {error ? (
          <Alert>⚠️ {error}</Alert>
        ) : (
          <textarea
            className={styles.codeArea}
            value={output}
            readOnly
            spellCheck={false}
          />
        )}
      </div>
    </div>
  );
}

function EncodeDecode({
  mode,
  onChange,
}: {
  mode: "encode" | "decode";
  onChange: (m: "encode" | "decode") => void;
}) {
  const { t } = useI18n();
  return (
    <Segmented
      value={mode}
      onChange={onChange}
      options={[
        { value: "encode", label: t("tools.encode") },
        { value: "decode", label: t("tools.decode") },
      ]}
    />
  );
}

export function Base64Tool() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    try {
      if (!input) return { output: "", error: null };
      return {
        output: mode === "encode" ? base64Encode(input) : base64Decode(input),
        error: null,
      };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  return (
    <IOArea
      inputLabel={t("tools.input")}
      outputLabel={t("tools.output")}
      input={input}
      output={output}
      error={error}
      onInput={setInput}
      controls={<EncodeDecode mode={mode} onChange={setMode} />}
    />
  );
}

export function UrlTool() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [input, setInput] = useState("");

  const { output, error } = useMemo(() => {
    try {
      if (!input) return { output: "", error: null };
      return {
        output:
          mode === "encode"
            ? encodeURIComponent(input)
            : decodeURIComponent(input),
        error: null,
      };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [input, mode]);

  return (
    <IOArea
      inputLabel={t("tools.input")}
      outputLabel={t("tools.output")}
      input={input}
      output={output}
      error={error}
      onInput={setInput}
      controls={<EncodeDecode mode={mode} onChange={setMode} />}
    />
  );
}

export function JwtTool() {
  const { t } = useI18n();
  const [token, setToken] = useState("");

  const { output, error } = useMemo(() => {
    try {
      if (!token.trim()) return { output: "", error: null };
      const { header, payload } = decodeJwt(token);
      const out =
        `// ${t("tools.header")}\n` +
        JSON.stringify(header, null, 2) +
        `\n\n// ${t("tools.payload")}\n` +
        JSON.stringify(payload, null, 2);
      return { output: out, error: null };
    } catch (e) {
      return { output: "", error: (e as Error).message };
    }
  }, [token, t]);

  return (
    <IOArea
      inputLabel={t("tools.token")}
      outputLabel={`${t("tools.header")} + ${t("tools.payload")}`}
      input={token}
      output={output}
      error={error}
      onInput={setToken}
      controls={<span className={styles.note}>{t("tools.jwtNote")}</span>}
    />
  );
}

export function HashTool() {
  const { t } = useI18n();
  const [algo, setAlgo] = useState<HashAlgo>("SHA-256");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  useEffect(() => {
    let cancelled = false;
    if (!input) {
      setOutput("");
      return;
    }
    hashText(input, algo).then((h) => {
      if (!cancelled) setOutput(h);
    });
    return () => {
      cancelled = true;
    };
  }, [input, algo]);

  return (
    <IOArea
      inputLabel={t("tools.input")}
      outputLabel={algo}
      input={input}
      output={output}
      onInput={setInput}
      controls={
        <Field label={t("tools.algo")} inline>
          <select value={algo} onChange={(e) => setAlgo(e.target.value as HashAlgo)}>
            {HASH_ALGOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </Field>
      }
    />
  );
}

export function DiffTool() {
  const { t } = useI18n();
  const [left, setLeft] = useState("");
  const [right, setRight] = useState("");

  const result = useMemo(() => diffLines(left, right), [left, right]);
  const hasInput = left.length > 0 || right.length > 0;
  const changed = result.added > 0 || result.removed > 0;

  return (
    <div className={styles.io}>
      <div className={styles.diffInputs}>
        <Field label={t("tools.left")}>
          <textarea
            className={styles.codeArea}
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
          />
        </Field>
        <Field label={t("tools.right")}>
          <textarea
            className={styles.codeArea}
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
          />
        </Field>
      </div>

      {hasInput && (
        <div className={styles.diffStats}>
          <span className={styles.added}>{t("tools.added", { n: result.added })}</span>
          <span className={styles.removed}>
            {t("tools.removed", { n: result.removed })}
          </span>
        </div>
      )}

      {hasInput &&
        (changed ? (
          <div className={styles.diffView}>
            {result.rows.map((row, i) => (
              <div
                key={i}
                className={[styles.diffRow, styles[row.type]]
                  .filter(Boolean)
                  .join(" ")}
              >
                <span className={styles.gutter}>{row.leftNo ?? ""}</span>
                <span className={`${styles.cell} ${styles.cellLeft}`}>
                  {row.left ?? ""}
                </span>
                <span className={styles.gutter}>{row.rightNo ?? ""}</span>
                <span className={`${styles.cell} ${styles.cellRight}`}>
                  {row.right ?? ""}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <Alert tone="success">{t("tools.identical")}</Alert>
        ))}
    </div>
  );
}

export function JsonTool() {
  const { t } = useI18n();
  const [mode, setMode] = useState<"format" | "minify">("format");
  const [indent, setIndent] = useState(2);
  const [input, setInput] = useState("");

  const { output, error, valid } = useMemo(() => {
    if (!input.trim())
      return { output: "", error: null as string | null, valid: false };
    try {
      const parsed = JSON.parse(input);
      const out =
        mode === "minify"
          ? JSON.stringify(parsed)
          : JSON.stringify(parsed, null, indent);
      return { output: out, error: null, valid: true };
    } catch (e) {
      return { output: "", error: (e as Error).message, valid: false };
    }
  }, [input, mode, indent]);

  return (
    <div className={styles.io}>
      <div className={styles.controls}>
        <Segmented
          value={mode}
          onChange={setMode}
          options={[
            { value: "format", label: t("tools.format") },
            { value: "minify", label: t("tools.minify") },
          ]}
        />
        {mode === "format" && (
          <Field label={t("tools.indent")} inline>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </Field>
        )}
      </div>

      <div className={styles.split}>
        <div className={styles.col}>
          <div className={styles.colHead}>{t("tools.input")}</div>
          <textarea
            className={`${styles.codeArea} ${styles.splitArea}`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </div>
        <div className={styles.col}>
          <div className={`${styles.colHead} ${styles.between}`}>
            <span>{valid ? t("tools.valid") : t("tools.output")}</span>
            <CopyButton text={output} />
          </div>
          {error ? (
            <Alert>⚠️ {error}</Alert>
          ) : (
            <textarea
              className={`${styles.codeArea} ${styles.splitArea}`}
              value={output}
              readOnly
              spellCheck={false}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export function UuidTool() {
  const { t } = useI18n();
  const [count, setCount] = useState(5);
  const [list, setList] = useState<string[]>(() => generateUuids(5));

  const output = list.join("\n");

  return (
    <div className={styles.io}>
      <div className={styles.controls}>
        <Field label={t("tools.count")} inline>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
            }
          />
        </Field>
        <Button variant="ghost" size="sm" onClick={() => setList(generateUuids(count))}>
          {t("tools.generate")}
        </Button>
        <CopyButton text={output} />
      </div>
      <textarea
        className={styles.codeArea}
        value={output}
        readOnly
        spellCheck={false}
      />
    </div>
  );
}
