// Starts all three echo servers in one process (npm start).
import { startWsServer } from "./ws-server.js";
import { startSocketIoServer } from "./socketio-server.js";
import { startSignalRServer } from "./signalr-server.js";

console.log("Starting Playground test servers…\n");
startWsServer();
startSocketIoServer();
startSignalRServer();

console.log(`
Playground tester inputs:
  WebSocket   URL:    ws://localhost:7001
  Socket.IO   URL:    http://localhost:7002        (event: message)
  SignalR     hub:    http://localhost:7003/hub    (listen: ReceiveMessage · invoke: SendMessage ["hello"])
`);
