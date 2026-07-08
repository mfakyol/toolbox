// Plain WebSocket echo server for the Playground "WebSocket" tab.
//   Tester URL:  ws://localhost:7001
import { WebSocketServer } from "ws";

const PORT = Number(process.env.WS_PORT) || 7001;

export function startWsServer() {
  const wss = new WebSocketServer({ port: PORT });

  wss.on("connection", (ws) => {
    ws.send("👋 connected to ws echo server");
    ws.on("message", (data) => {
      // Echo whatever we receive straight back.
      ws.send(data.toString());
    });
  });

  console.log(`✅ WebSocket echo   →  ws://localhost:${PORT}`);
  return wss;
}

// Allow running this file directly (npm run ws).
if (import.meta.url === `file://${process.argv[1]}`) startWsServer();
