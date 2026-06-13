import { databaseUrl } from "./database.js";
import { vpc } from "./network.js";

export const migrationFunction = new sst.aws.Function("AtlasMigrate", {
  handler: "packages/db/src/migrate-handler.handler",
  runtime: "nodejs22.x",
  memory: "512 MB",
  timeout: "5 minutes",
  vpc,
  environment: {
    DATABASE_URL: databaseUrl,
  },
  copyFiles: [{ from: "packages/db/drizzle", to: "drizzle" }],
});
