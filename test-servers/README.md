# 🧪 Playground test servers

Local echo/mock servers to try the **API Playground** (`/playground`) against.
Standalone — not part of the app or its Docker build.

```bash
cd test-servers
npm install
npm start        # starts all three
# or individually:  npm run ws | npm run socketio | npm run signalr
```

## Tester inputs

| Tab | URL | Notes |
|-----|-----|-------|
| **WebSocket** | `ws://localhost:7001` | Echoes every message; sends a welcome line on connect. |
| **Socket.IO** | `http://localhost:7002` | Path `/socket.io`. Emits `welcome` on connect; echoes any event back under the same name. Try event `message`. |
| **SignalR** | `http://localhost:7003/hub` | Listen: `ReceiveMessage` · Invoke: `SendMessage` args `["hello"]`. Invoking `SendMessage` broadcasts `ReceiveMessage` to all clients and completes the call. |

> Run these from the **dev** client (`http://localhost:6001`), which is served over
> HTTP — so `ws://` and `http://` targets work without mixed-content issues.

## About the SignalR server

There is **no ASP.NET** here. `signalr-server.js` implements just enough of the
SignalR JSON hub protocol (negotiate → WebSocket → `{"protocol":"json"}` handshake
→ `\x1e`-framed Invocation/Completion/Ping messages) for the official
`@microsoft/signalr` client to connect, `invoke`, and receive messages.
