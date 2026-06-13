import { secrets } from "./secrets.js";
import { queues } from "./queues.js";
import { storage } from "./storage.js";
import { databaseUrl } from "./database.js";
import { vpc } from "./network.js";

export const api = new sst.aws.Function("AtlasApi", {
  handler: "packages/api/src/index.handler",
  runtime: "nodejs22.x",
  memory: "512 MB",
  timeout: "30 seconds",
  vpc,
  nodejs: {
    install: ["@node-rs/argon2", "@node-rs/argon2-linux-x64-gnu"],
  },
  url: {
    cors: false,
  },
  environment: {
    NODE_ENV: $app.stage === "prod" ? "production" : "development",
    STAGE: $app.stage,
    ALLOWED_ORIGINS: $app.stage === "prod"
      ? "https://goatlas.co.uk"
      : "http://localhost:5173",
    FRONTEND_URL: $app.stage === "prod"
      ? "https://goatlas.co.uk"
      : "http://localhost:5173",
    DATABASE_URL: databaseUrl,
    PROCESS_ACTIVITY_QUEUE_URL: queues.processActivity.queue.url,
    STRAVA_SYNC_QUEUE_URL: queues.stravaSync.queue.url,
    EMAIL_QUEUE_URL: queues.email.queue.url,
    UPLOADS_BUCKET: storage.uploads.name,
  },
  link: [
    secrets.stravaClientId,
    secrets.stravaClientSecret,
    secrets.sessionSecret,
    queues.processActivity.queue,
    queues.stravaSync.queue,
    queues.email.queue,
    storage.uploads,
  ],
});
