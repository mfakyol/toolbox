import express from "express";
import cors from "cors";
import helmet from "helmet";
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

  // Behind exactly two proxy hops in production (host nginx → container nginx).
  // A fixed count (not `true`) is deliberate: trusting the whole chain would let
  // a client spoof X-Forwarded-For, which also skews IP-based rate limiting.
  if (config.isProd) app.set("trust proxy", 2);

  // Security headers. CSP is intentionally left to whatever serves the app HTML
  // (the nginx host) — this API only returns JSON — so disable helmet's CSP and
  // keep the rest (HSTS in prod, X-Content-Type-Options, referrer-policy, …).
  app.use(
    helmet({
      contentSecurityPolicy: false,
      hsts: config.isProd,
    })
  );

  // Cookies must be sent cross-origin, so a specific origin (not "*") plus
  // credentials is required once auth is in play.
  app.use(cors({ origin: config.corsOrigin, credentials: true }));

  // Cap JSON body size. Tool payloads are small; large uploads go through
  // multipart (multer) with their own limits, not this parser.
  app.use(express.json({ limit: "256kb" }));

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
