// Socket.IO echo server for the Playground "Socket.IO" tab.
//   Tester URL:  http://localhost:7002   (path: /socket.io)
// CORS is open because the Socket.IO handshake is an HTTP request subject to
// the browser's same-origin policy.
import { createServer } from "node:http";
import { Server } from "socket.io";

const PORT = Number(process.env.SIO_PORT) || 7002;

export function startSocketIoServer() {
  const httpServer = createServer();
  const io = new Server(httpServer, { cors: { origin: "*" } });

  io.on("connection", (socket) => {
    socket.emit("welcome", { id: socket.id, msg: "connected to socket.io echo" });

    // Echo every inbound event back to the sender under the same name.
    socket.onAny((event, ...args) => {
      socket.emit(event, ...args);
    });
  });

  httpServer.listen(PORT, () => {
    console.log(`✅ Socket.IO echo   →  http://localhost:${PORT}`);
  });
  return io;
}

if (import.meta.url === `file://${process.argv[1]}`) startSocketIoServer();
