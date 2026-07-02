import { useEffect, useMemo, useState } from "react";
import { useI18n } from "../i18n";
import { CopyButton } from "./CopyButton";
import {
  base64Encode,
  base64Decode,
  decodeJwt,
  hashText,
  generateUuids,
  HASH_ALGOS,
  type HashAlgo,
} from "../utils/devtools";
import { diffLines } from "../utils/diff";

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
    <div className="tool-io">
      <label className="field">
        <span>{inputLabel}</span>
        <textarea
          className="code-area small"
          value={input}
          onChange={(e) => onInput(e.target.value)}
          spellCheck={false}
        />
      </label>

      {controls && <div className="tool-controls">{controls}</div>}

      <label className="field">
        <div className="tool-out-head">
          <span>{outputLabel}</span>
          <CopyButton text={output} />
        </div>
        {error ? (
          <div className="error">⚠️ {error}</div>
        ) : (
          <textarea
            className="code-area small"
            value={output}
            readOnly
            spellCheck={false}
          />
        )}
      </label>
    </div>
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
      controls={
        <div className="seg">
          <button
            className={`seg-btn ${mode === "encode" ? "active" : ""}`}
            onClick={() => setMode("encode")}
          >
            {t("tools.encode")}
          </button>
          <button
            className={`seg-btn ${mode === "decode" ? "active" : ""}`}
            onClick={() => setMode("decode")}
          >
            {t("tools.decode")}
          </button>
        </div>
      }
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
      controls={
        <div className="seg">
          <button
            className={`seg-btn ${mode === "encode" ? "active" : ""}`}
            onClick={() => setMode("encode")}
          >
            {t("tools.encode")}
          </button>
          <button
            className={`seg-btn ${mode === "decode" ? "active" : ""}`}
            onClick={() => setMode("decode")}
          >
            {t("tools.decode")}
          </button>
        </div>
      }
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
      controls={<span className="tool-note">{t("tools.jwtNote")}</span>}
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
        <label className="field inline">
          <span>{t("tools.algo")}</span>
          <select
            value={algo}
            onChange={(e) => setAlgo(e.target.value as HashAlgo)}
          >
            {HASH_ALGOS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
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
    <div className="tool-io">
      <div className="diff-inputs">
        <label className="field">
          <span>{t("tools.left")}</span>
          <textarea
            className="code-area small"
            value={left}
            onChange={(e) => setLeft(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="field">
          <span>{t("tools.right")}</span>
          <textarea
            className="code-area small"
            value={right}
            onChange={(e) => setRight(e.target.value)}
            spellCheck={false}
          />
        </label>
      </div>

      {hasInput && (
        <div className="diff-stats">
          <span className="diff-added">{t("tools.added", { n: result.added })}</span>
          <span className="diff-removed">
            {t("tools.removed", { n: result.removed })}
          </span>
        </div>
      )}

      {hasInput &&
        (changed ? (
          <div className="diff-view">
            {result.rows.map((row, i) => (
              <div key={i} className={`diff-row diff-${row.type}`}>
                <span className="diff-gutter">{row.leftNo ?? ""}</span>
                <span className="diff-cell left">{row.left ?? ""}</span>
                <span className="diff-gutter">{row.rightNo ?? ""}</span>
                <span className="diff-cell right">{row.right ?? ""}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="fav-done">{t("tools.identical")}</div>
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
    <div className="tool-io">
      <div className="tool-controls">
        <div className="seg">
          <button
            className={`seg-btn ${mode === "format" ? "active" : ""}`}
            onClick={() => setMode("format")}
          >
            {t("tools.format")}
          </button>
          <button
            className={`seg-btn ${mode === "minify" ? "active" : ""}`}
            onClick={() => setMode("minify")}
          >
            {t("tools.minify")}
          </button>
        </div>
        {mode === "format" && (
          <label className="field inline">
            <span>{t("tools.indent")}</span>
            <select
              value={indent}
              onChange={(e) => setIndent(Number(e.target.value))}
            >
              <option value={2}>2</option>
              <option value={4}>4</option>
            </select>
          </label>
        )}
      </div>

      <div className="io-split">
        <label className="field">
          <span>{t("tools.input")}</span>
          <textarea
            className="code-area small"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />
        </label>
        <label className="field">
          <div className="tool-out-head">
            <span>{valid ? t("tools.valid") : t("tools.output")}</span>
            <CopyButton text={output} />
          </div>
          {error ? (
            <div className="error">⚠️ {error}</div>
          ) : (
            <textarea
              className="code-area small"
              value={output}
              readOnly
              spellCheck={false}
            />
          )}
        </label>
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
    <div className="tool-io">
      <div className="tool-controls">
        <label className="field inline">
          <span>{t("tools.count")}</span>
          <input
            type="number"
            min={1}
            max={100}
            value={count}
            onChange={(e) =>
              setCount(Math.min(100, Math.max(1, Number(e.target.value) || 1)))
            }
          />
        </label>
        <button
          className="ghost-btn slim"
          onClick={() => setList(generateUuids(count))}
        >
          {t("tools.generate")}
        </button>
        <CopyButton text={output} />
      </div>
      <textarea
        className="code-area small"
        value={output}
        readOnly
        spellCheck={false}
      />
    </div>
  );
}
