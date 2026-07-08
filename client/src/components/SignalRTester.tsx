import { useEffect, useRef, useState } from "react";
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
} from "@microsoft/signalr";
import { useI18n } from "../i18n";
import { useLog, LogView } from "./Playground";
import { Button, Badge, Field, type BadgeTone } from "./ui";
import styles from "./Playground.module.scss";

// SignalR tester. Loaded lazily so @microsoft/signalr stays out of the main
// bundle. Unlike Socket.IO, SignalR has no catch-all listener, so the user
// declares which hub method names to subscribe to.
export default function SignalRTester() {
  const { t } = useI18n();
  const { log, push, clear } = useLog();

  const [url, setUrl] = useState("https://your-server/hub");
  const [listen, setListen] = useState("ReceiveMessage");
  const [method, setMethod] = useState("SendMessage");
  const [args, setArgs] = useState('["hello"]');
  const [status, setStatus] = useState<"closed" | "connecting" | "open">("closed");
  const connRef = useRef<HubConnection | null>(null);

  useEffect(() => () => void connRef.current?.stop(), []);

  async function connect() {
    clear();
    setStatus("connecting");
    push("sys", t("play.wsConnecting"));

    const conn = new HubConnectionBuilder().withUrl(url).withAutomaticReconnect().build();
    connRef.current = conn;

    // Register listeners before starting so early messages aren't missed.
    listen
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean)
      .forEach((name) =>
        conn.on(name, (...a: unknown[]) => push("in", `${name}: ${JSON.stringify(a)}`))
      );

    conn.onclose((err) => {
      setStatus("closed");
      push("sys", err ? `${t("play.wsError")}: ${err.message}` : t("play.wsClosed"));
    });

    try {
      await conn.start();
      setStatus("open");
      push("sys", t("play.wsOpen"));
    } catch (err) {
      setStatus("closed");
      push("sys", `${t("play.wsError")}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  async function disconnect() {
    await connRef.current?.stop();
    connRef.current = null;
  }

  async function invoke() {
    const conn = connRef.current;
    if (conn?.state !== HubConnectionState.Connected || !method.trim()) return;

    let parsedArgs: unknown[] = [];
    try {
      const p = JSON.parse(args || "[]");
      parsedArgs = Array.isArray(p) ? p : [p];
    } catch {
      push("sys", t("play.signalrBadArgs"));
      return;
    }

    push("out", `${method.trim()}(${JSON.stringify(parsedArgs)})`);
    try {
      const result = await conn.invoke(method.trim(), ...parsedArgs);
      if (result !== undefined) push("in", `↩ ${JSON.stringify(result)}`);
    } catch (err) {
      push("sys", `${t("play.wsError")}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const connected = status === "open";
  const statusTone: BadgeTone =
    status === "open" ? "success" : status === "connecting" ? "warn" : "neutral";

  return (
    <div className={styles.io}>
      <p className={styles.note}>{t("play.signalrNote")}</p>

      <div className={styles.reqRow}>
        <input
          className={styles.url}
          placeholder="https://…/hub"
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

      <Field label={t("play.signalrListen")}>
        <input
          className={styles.url}
          placeholder="ReceiveMessage, Notify"
          value={listen}
          disabled={status !== "closed"}
          onChange={(e) => setListen(e.target.value)}
        />
      </Field>

      <LogView log={log} empty={t("play.wsEmpty")} />

      <div className={styles.reqRow}>
        <input
          className={styles.sioEvent}
          placeholder={t("play.signalrMethod")}
          value={method}
          disabled={!connected}
          onChange={(e) => setMethod(e.target.value)}
        />
        <input
          className={styles.url}
          placeholder={t("play.signalrArgs")}
          value={args}
          disabled={!connected}
          onChange={(e) => setArgs(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && invoke()}
        />
        <Button size="sm" onClick={invoke} disabled={!connected || !method.trim()}>
          {t("play.invoke")}
        </Button>
      </div>
    </div>
  );
}
