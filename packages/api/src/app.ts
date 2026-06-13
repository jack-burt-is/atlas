import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import type { AppEnv } from "./types.js";
import auth from "./routes/auth.js";
import account from "./routes/account.js";
import activities from "./routes/activities.js";
import integrations from "./routes/integrations.js";
import webhooks from "./routes/webhooks.js";
import collections from "./routes/collections.js";
import features from "./routes/features.js";
import profile from "./routes/profile.js";
import map from "./routes/map.js";
import achievements from "./routes/achievements.js";

const app = new Hono<AppEnv>();

const allowedOrigins = process.env["ALLOWED_ORIGINS"]?.split(",") ?? [
  "http://localhost:5173",
];

app.use(
  "*",
  cors({
    origin: allowedOrigins,
    credentials: true,
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type"],
  }),
);

app.use("*", secureHeaders());

app.onError((err, c) => {
  console.error("[api error]", err);
  return c.json({ error: err.message ?? "Internal server error" }, 500);
});

app.get("/health", (c) => c.json({ ok: true, ts: new Date().toISOString() }));

app.route("/auth", auth);
app.route("/account", account);
app.route("/activities", activities);
app.route("/integrations", integrations);
app.route("/webhooks", webhooks);
app.route("/collections", collections);
app.route("/", features);
app.route("/profile", profile);
app.route("/map", map);
app.route("/achievements", achievements);

export default app;
