// A minimal SignalR-COMPATIBLE hub in Node.js — no ASP.NET required. It speaks
// just enough of the SignalR protocol for the official @microsoft/signalr JS
// client to connect, invoke, and receive messages.
//
//   Tester hub URL:   http://localhost:7003/hub
//   Listen methods:   ReceiveMessage
//   Invoke method:    SendMessage   args: ["hello"]
//
// Protocol summary (JSON hub protocol):
//   1. POST  /hub/negotiate      → connection info + available transports
//   2. WS    /hub?id=<token>     → transport
//   3. Client sends handshake    {"protocol":"json","version":1}\x1e
//      Server replies            {}\x1e                     (empty = success)
//   4. Messages are JSON records separated by 0x1e (RS). Types used here:
//        1 = Invocation, 3 = Completion, 6 = Ping
//
// Behaviour: when a client invokes SendMessage(args), the hub broadcasts
// ReceiveMessage(args) to every connected client and completes the invocation.
import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { WebSocketServer } from "ws";

const PORT = Number(process.env.SIGNALR_PORT) || 7003;
const RS = "\x1e"; // record separator that terminates every SignalR message

function cors(res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "*");
}

export function startSignalRServer() {
  const httpServer = createServer((req, res) => {
    cors(res);
    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, "http://localhost");
    // SignalR negotiate handshake.
    if (req.method === "POST" && url.pathname === "/hub/negotiate") {
      const token = randomUUID();
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          negotiateVersion: 1,
          connectionId: token,
          connectionToken: token,
          availableTransports: [
            { transport: "WebSockets", transferFormats: ["Text", "Binary"] },
          ],
        })
      );
      return;
    }

    res.writeHead(404);
    res.end();
  });

  const wss = new WebSocketServer({ server: httpServer, path: "/hub" });
  const clients = new Set();

  wss.on("connection", (ws) => {
    let handshaken = false;
    clients.add(ws);

    // Keepalive pings so the client's serverTimeout doesn't fire.
    const ping = setInterval(() => {
      if (ws.readyState === ws.OPEN) ws.send(`{"type":6}${RS}`);
    }, 15000);

    ws.on("message", (raw) => {
      // A frame may contain several RS-terminated records.
      for (const part of raw.toString().split(RS).filter(Boolean)) {
        let msg;
        try {
          msg = JSON.parse(part);
        } catch {
          continue;
        }

        // First message is the protocol handshake (no "type" field).
        if (!handshaken) {
          ws.send(`{}${RS}`); // empty object = handshake success
          handshaken = true;
          continue;
        }

        if (msg.type === 6) continue; // ping — ignore

        if (msg.type === 1) {
          // Invocation from the client (e.g. SendMessage).
          const invocation =
            JSON.stringify({
              type: 1,
              target: "ReceiveMessage",
              arguments: msg.arguments ?? [],
            }) + RS;
          for (const c of clients) {
            if (c.readyState === c.OPEN) c.send(invocation);
          }
          // If the client used invoke() (has invocationId), complete it so the
          // returned promise resolves.
          if (msg.invocationId != null) {
            ws.send(
              JSON.stringify({
                type: 3,
                invocationId: msg.invocationId,
                result: "ok",
              }) + RS
            );
          }
        }
      }
    });

    ws.on("close", () => {
      clearInterval(ping);
      clients.delete(ws);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`✅ SignalR hub      →  http://localhost:${PORT}/hub`);
  });
  return httpServer;
}

if (import.meta.url === `file://${process.argv[1]}`) startSignalRServer();
