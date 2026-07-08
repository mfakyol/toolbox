import express from "express";
import cors from "cors";
import session from "express-session";
import MongoStore from "connect-mongo";
import passport from "passport";
import { config } from "./config/index.js";
import { configurePassport } from "./config/passport.js";
import routes from "./routes/index.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

// Sets up and returns the Express app (server.ts does the listening).
export function createApp() {
  const app = express();

  // Behind a proxy chain in production (host nginx → container nginx). Trust
  // the forwarded headers so req.secure / Secure cookies work correctly.
  if (config.isProd) app.set("trust proxy", true);

  // Cookies must be sent cross-origin, so a specific origin (not "*") plus
  // credentials is required once auth is in play.
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  app.use(express.json());

  app.use(
    session({
      name: "toolbox.sid",
      secret: config.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({ mongoUrl: config.mongoUri }),
      cookie: {
        httpOnly: true,
        sameSite: "lax",
        secure: config.cookieSecure,
        // Default: session cookie (cleared on browser close). "Remember me"
        // upgrades this to a persistent 1-year cookie at login time.
      },
    })
  );

  configurePassport();
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/api", routes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
