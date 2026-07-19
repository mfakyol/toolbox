import mongoose from "mongoose";
import type { Server } from "node:http";
import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDb } from "./config/db.js";
import { seedAdmin } from "./config/seedAdmin.js";
import { startSecretSweeper } from "./services/secret.service.js";
import { startTransferSweeper } from "./services/transfer.service.js";

// Graceful shutdown: stop accepting new connections, drain in-flight requests,
// close the DB, and force-exit if draining hangs past the timeout.
function installShutdown(server: Server) {
  let shuttingDown = false;

  async function shutdown(signal: string) {
    if (shuttingDown) return;
    shuttingDown = true;
    console.log(`\n${signal} alındı, kapatılıyor…`);

    const forceExit = setTimeout(() => {
      console.error("Zamanında kapanmadı, zorla çıkılıyor.");
      process.exit(1);
    }, 10_000);
    forceExit.unref();

    server.close(async () => {
      try {
        await mongoose.connection.close();
      } catch (err) {
        console.error("MongoDB kapatma hatası:", err);
      }
      clearTimeout(forceExit);
      process.exit(0);
    });
  }

  process.on("SIGTERM", () => void shutdown("SIGTERM"));
  process.on("SIGINT", () => void shutdown("SIGINT"));
}

async function start() {
  await connectDb();
  await seedAdmin();
  startSecretSweeper(); // wipe expired one-time secrets periodically
  startTransferSweeper(); // wipe expired file transfers periodically

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`✅ Toolbox API: http://localhost:${config.port}`);
  });

  installShutdown(server);
}

start().catch((err) => {
  console.error("❌ Sunucu başlatılamadı:", err);
  process.exit(1);
});
