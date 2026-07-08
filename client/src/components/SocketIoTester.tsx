import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useI18n } from "../i18n";
import { useLog, LogView, parseMaybeJson } from "./Playground";

// Socket.IO tester. Loaded lazily so socket.io-client stays out of the main
// bundle and only downloads when this tab is opened.
export default function SocketIoTester() {
  const { t } = useI18n();
  const { log, push, clear } = useLog();

  const [url, setUrl] = useState("https://socketio-echo.glitch.me");
  const [path, setPath] = useState("/socket.io");
  const [event, setEvent] = useState("message");
  const [payload, setPayload] = useState("");
  const [status, setStatus] = useState<"closed" | "connecting" | "open">("closed");
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => () => void socketRef.current?.disconnect(), []);

  function connect() {
    clear();
    setStatus("connecting");
    push("sys", t("play.wsConnecting"));

    const socket = io(url, {
      path: path.trim() || "/socket.io",
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      setStatus("open");
      push("sys", `${t("play.wsOpen")} · id=${socket.id}`);
    });
    socket.on("disconnect", (reason) => {
      setStatus("closed");
      push("sys", `${t("play.wsClosed")} (${reason})`);
    });
    socket.on("connect_error", (err: Error) => {
      push("sys", `${t("play.wsError")}: ${err.message}`);
    });
    // Catch every inbound event.
    socket.onAny((name: string, ...args: unknown[]) => {
      push("in", `${name}: ${JSON.stringify(args)}`);
    });
  }

  function disconnect() {
    socketRef.current?.disconnect();
    socketRef.current = null;
  }

  function emit() {
    const socket = socketRef.current;
    if (!socket?.connected || !event.trim()) return;
    const data = parseMaybeJson(payload);
    socket.emit(event.trim(), data);
    push("out", `${event.trim()}: ${JSON.stringify(data ?? null)}`);
  }

  const connected = status === "open";

  return (
    <div className="tool-io">
      <p className="tool-note">{t("play.sioNote")}</p>

      <div className="play-req-row">
        <input
          className="play-url"
          placeholder="https://…"
          value={url}
          disabled={status !== "closed"}
          onChange={(e) => setUrl(e.target.value)}
        />
        {status === "closed" ? (
          <button className="convert-btn slim" onClick={connect} disabled={!url}>
            {t("play.connect")}
          </button>
        ) : (
          <button className="ghost-btn slim" onClick={disconnect}>
            {t("play.disconnect")}
          </button>
        )}
        <span className={`badge play-ws-status play-ws-${status}`}>
          {t(`play.${status}`)}
        </span>
      </div>

      <label className="field">
        <span>{t("play.sioPath")}</span>
        <input
          className="play-url"
          value={path}
          disabled={status !== "closed"}
          onChange={(e) => setPath(e.target.value)}
        />
      </label>

      <LogView log={log} empty={t("play.wsEmpty")} />

      <div className="play-req-row">
        <input
          className="play-sio-event"
          placeholder={t("play.sioEvent")}
          value={event}
          disabled={!connected}
          onChange={(e) => setEvent(e.target.value)}
        />
        <input
          className="play-url"
          placeholder={t("play.sioPayload")}
          value={payload}
          disabled={!connected}
          onChange={(e) => setPayload(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && emit()}
        />
        <button
          className="convert-btn slim"
          onClick={emit}
          disabled={!connected || !event.trim()}
        >
          {t("play.emit")}
        </button>
      </div>
    </div>
  );
}
