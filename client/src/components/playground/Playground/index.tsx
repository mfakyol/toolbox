import { useCallback, useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { CopyButton } from "@/components/CopyButton";
import { formatBytes } from "@/utils/format";
import { Button, Badge, Field, Alert, type BadgeTone } from "@/components/ui";
import styles from "./styles.module.scss";

// ---- Shared log helpers (reused by the WS / Socket.IO / SignalR testers) ----
export type LogDir = "in" | "out" | "sys";
export interface LogEntry {
  dir: LogDir;
  text: string;
  time: string;
}

// Shared log helpers colocated with the log component, reused by the testers.
// eslint-disable-next-line react-refresh/only-export-components
export function useLog() {
  const [log, setLog] = useState<LogEntry[]>([]);
  const push = useCallback((dir: LogDir, text: string) => {
    setLog((l) => [...l, { dir, text, time: new Date().toLocaleTimeString() }]);
  }, []);
  const clear = useCallback(() => setLog([]), []);
  return { log, push, clear };
}

export function LogView({ log, empty }: { log: LogEntry[]; empty: string }) {
  const endRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [log]);

  return (
    <div className={styles.log}>
      {log.length === 0 ? (
        <p className={styles.empty}>{empty}</p>
      ) : (
        log.map((e, i) => (
          <div className={`${styles.logLine} ${styles[e.dir]}`} key={i}>
            <span className={styles.logTime}>{e.time}</span>
            <span className={styles.logArrow}>
              {e.dir === "in" ? "←" : e.dir === "out" ? "→" : "•"}
            </span>
            <span className={styles.logText}>{e.text}</span>
          </div>
        ))
      )}
      <div ref={endRef} />
    </div>
  );
}

// Parses a string as JSON, falling back to the raw string.
// eslint-disable-next-line react-refresh/only-export-components
export function parseMaybeJson(raw: string): unknown {
  const s = raw.trim();
  if (!s) return undefined;
  try {
    return JSON.parse(s);
  } catch {
    return raw;
  }
}

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"] as const;
type Method = (typeof METHODS)[number];

interface HeaderRow {
  key: string;
  value: string;
}

interface HttpResult {
  status: number;
  statusText: string;
  timeMs: number;
  size: number;
  headers: [string, string][];
  body: string;
  contentType: string;
}

// ---- HTTP request tester (curl-like, runs entirely in the browser) ----
export function HttpTester() {
  const { t } = useI18n();

  const [method, setMethod] = useState<Method>("GET");
  const [url, setUrl] = useState("https://httpbin.org/get");
  const [headers, setHeaders] = useState<HeaderRow[]>([{ key: "", value: "" }]);
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<HttpResult | null>(null);

  const bodyAllowed = method !== "GET" && method !== "HEAD";

  function setHeader(i: number, patch: Partial<HeaderRow>) {
    setHeaders((rows) => rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }
  function addHeader() {
    setHeaders((rows) => [...rows, { key: "", value: "" }]);
  }
  function removeHeader(i: number) {
    setHeaders((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function send() {
    setError(null);
    setResult(null);
    setSending(true);
    const started = performance.now();
    try {
      const h = new Headers();
      headers.forEach((r) => r.key.trim() && h.append(r.key.trim(), r.value));

      const res = await fetch(url, {
        method,
        headers: h,
        body: bodyAllowed && body ? body : undefined,
      });

      const text = await res.text();
      const timeMs = Math.round(performance.now() - started);
      setResult({
        status: res.status,
        statusText: res.statusText,
        timeMs,
        size: new Blob([text]).size,
        headers: [...res.headers.entries()],
        body: text,
        contentType: res.headers.get("content-type") ?? "",
      });
    } catch (err) {
      // Cross-origin failures surface here as an opaque TypeError.
      setError(
        `${err instanceof Error ? err.message : String(err)} — ${t("play.corsNote")}`
      );
    } finally {
      setSending(false);
    }
  }

  function prettyBody(r: HttpResult) {
    if (r.contentType.includes("application/json")) {
      try {
        return JSON.stringify(JSON.parse(r.body), null, 2);
      } catch {
        /* fall through */
      }
    }
    return r.body;
  }

  return (
    <div className={styles.io}>
      <p className={styles.note}>{t("play.httpNote")}</p>

      <div className={styles.reqRow}>
        <select
          className={styles.method}
          value={method}
          onChange={(e) => setMethod(e.target.value as Method)}
        >
          {METHODS.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
        <input
          className={styles.url}
          placeholder={t("play.urlPlaceholder")}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button size="sm" onClick={send} disabled={sending || !url}>
          {sending ? t("play.sending") : t("play.send")}
        </Button>
      </div>

      <div className={styles.group}>
        <span className={styles.groupLabel}>{t("play.headers")}</span>
        {headers.map((row, i) => (
          <div className={styles.headerRow} key={i}>
            <input
              placeholder={t("play.headerKey")}
              value={row.key}
              onChange={(e) => setHeader(i, { key: e.target.value })}
            />
            <input
              placeholder={t("play.headerValue")}
              value={row.value}
              onChange={(e) => setHeader(i, { value: e.target.value })}
            />
            <Button variant="ghost" size="sm" onClick={() => removeHeader(i)}>
              ✕
            </Button>
          </div>
        ))}
        <Button
          variant="ghost"
          size="sm"
          className={styles.addHeader}
          onClick={addHeader}
        >
          + {t("play.addHeader")}
        </Button>
      </div>

      {bodyAllowed && (
        <Field label={t("play.body")}>
          <textarea
            className={styles.textarea}
            placeholder='{ "key": "value" }'
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
        </Field>
      )}

      {error && <Alert>{error}</Alert>}

      {result && (
        <div className={styles.response}>
          <div className={styles.statusBar}>
            <Badge tone={result.status < 400 ? "success" : "danger"}>
              {result.status} {result.statusText}
            </Badge>
            <span className={styles.muted}>{result.timeMs} ms</span>
            <span className={styles.muted}>{formatBytes(result.size)}</span>
            <CopyButton text={result.body} />
          </div>

          {result.headers.length > 0 && (
            <details className={styles.headersOut}>
              <summary>{t("play.respHeaders")}</summary>
              <pre>{result.headers.map(([k, v]) => `${k}: ${v}`).join("\n")}</pre>
            </details>
          )}

          <pre className={styles.bodyOut}>{prettyBody(result)}</pre>
        </div>
      )}
    </div>
  );
}

// ---- WebSocket tester (client-side; connects to any ws/wss endpoint) ----
export function WsTester() {
  const { t } = useI18n();
  const { log, push, clear } = useLog();

  const [url, setUrl] = useState("wss://ws.postman-echo.com/raw");
  const [status, setStatus] = useState<"closed" | "connecting" | "open">("closed");
  const [message, setMessage] = useState("");
  const wsRef = useRef<WebSocket | null>(null);

  // Close the socket if the component unmounts.
  useEffect(() => () => wsRef.current?.close(), []);

  function connect() {
    clear();
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;
      setStatus("connecting");
      push("sys", t("play.wsConnecting"));

      ws.onopen = () => {
        setStatus("open");
        push("sys", t("play.wsOpen"));
      };
      ws.onmessage = (e) => push("in", String(e.data));
      ws.onerror = () => push("sys", t("play.wsError"));
      ws.onclose = (e) => {
        setStatus("closed");
        push("sys", `${t("play.wsClosed")} (${e.code})`);
        wsRef.current = null;
      };
    } catch (err) {
      push("sys", err instanceof Error ? err.message : String(err));
      setStatus("closed");
    }
  }

  function disconnect() {
    wsRef.current?.close();
  }

  function sendMessage() {
    if (wsRef.current?.readyState === WebSocket.OPEN && message) {
      wsRef.current.send(message);
      push("out", message);
      setMessage("");
    }
  }

  const connected = status === "open";
  const statusTone: BadgeTone =
    status === "open" ? "success" : status === "connecting" ? "warn" : "neutral";

  return (
    <div className={styles.io}>
      <p className={styles.note}>{t("play.wsNote")}</p>

      <div className={styles.reqRow}>
        <input
          className={styles.url}
          placeholder={t("play.wsUrlPlaceholder")}
          value={url}
          disabled={status !== "closed"}
          onChange={(e) => setUrl(e.target.value)}
        />
        {status === "closed" ? (
          <Button size="sm" onClick={connect} disabled={!url}>
            {t("play.connect")}
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={disconnect}>
            {t("play.disconnect")}
          </Button>
        )}
        <Badge tone={statusTone}>{t(`play.${status}`)}</Badge>
      </div>

      <LogView log={log} empty={t("play.wsEmpty")} />

      <div className={styles.reqRow}>
        <input
          className={styles.url}
          placeholder={t("play.wsMessage")}
          value={message}
          disabled={!connected}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <Button size="sm" onClick={sendMessage} disabled={!connected || !message}>
          {t("play.send")}
        </Button>
      </div>
    </div>
  );
}
