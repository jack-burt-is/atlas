import { vpc } from "./network.js";

const isProd = $app.stage === "prod";

export const database = new sst.aws.Aurora("AtlasDb", {
  engine: "postgres",
  version: "16.4",
  database: "atlas",
  username: "atlas",
  vpc,
  scaling: isProd
    ? { min: "0.5 ACU", max: "16 ACU" }
    : { min: "0 ACU", max: "4 ACU" },
  // First migration must run: CREATE EXTENSION IF NOT EXISTS postgis;
  transform: {
    cluster: (args) => {
      if (!isProd) {
        args.serverlessv2ScalingConfiguration = {
          minCapacity: 0,
          maxCapacity: 4,
        };
      }
    },
  },
});

export const databaseUrl = $interpolate`postgresql://${database.username}:${database.password}@${database.host}:${database.port}/${database.database}`;
