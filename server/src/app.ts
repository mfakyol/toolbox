import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Sets up and returns the Express app (server.ts does the listening).
export function createApp() {
  const app = express();

  app.use(cors({ origin: config.corsOrigin }));

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
