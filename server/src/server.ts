import { createApp } from "./app.js";
import { config } from "./config/index.js";
import { connectDb } from "./config/db.js";
import { seedAdmin } from "./config/seedAdmin.js";
import { startSecretSweeper } from "./services/secret.service.js";
import { startTransferSweeper } from "./services/transfer.service.js";

async function start() {
  await connectDb();
  await seedAdmin();
  startSecretSweeper(); // wipe expired one-time secrets periodically
  startTransferSweeper(); // wipe expired file transfers periodically

  const app = createApp();
  app.listen(config.port, () => {
    console.log(`✅ Toolbox API: http://localhost:${config.port}`);
  });
}

start().catch((err) => {
  console.error("❌ Sunucu başlatılamadı:", err);
  process.exit(1);
});
