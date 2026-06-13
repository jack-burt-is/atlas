import { databaseUrl } from "./database.js";
import { vpc } from "./network.js";

export const seedAchievementsFunction = new sst.aws.Function("AtlasSeedAchievements", {
  handler: "packages/db/src/seeds/achievements-handler.handler",
  runtime: "nodejs22.x",
  memory: "512 MB",
  timeout: "2 minutes",
  vpc,
  environment: {
    DATABASE_URL: databaseUrl,
  },
});

export const seedGeoFunction = new sst.aws.Function("AtlasSeedGeo", {
  handler: "packages/db/src/seeds/geographic-data-handler.handler",
  runtime: "nodejs22.x",
  memory: "512 MB",
  // Overpass API queries can take 60-90s each; three queries + inserts needs headroom
  timeout: "15 minutes",
  vpc,
  environment: {
    DATABASE_URL: databaseUrl,
  },
});
