import { api } from "./api.js";

const isProd = $app.stage === "prod";

export const router = new sst.aws.Router("AtlasApiRouter", {
  domain: isProd ? "api.goatlas.co.uk" : undefined,
  routes: {
    "/*": api.url,
  },
});
