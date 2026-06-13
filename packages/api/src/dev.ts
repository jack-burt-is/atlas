import { serve } from "@hono/node-server";
import app from "./app.js";

serve(
  { fetch: app.fetch, port: 3000 },
  (info) => console.log(`Atlas API running on http://localhost:${info.port}`),
);
