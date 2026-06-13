/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "atlas",
      removal: input?.stage === "prod" ? "retain" : "remove",
      protect: ["prod"].includes(input?.stage ?? ""),
      home: "aws",
      providers: {
        aws: {
          region: "eu-west-2",
        },
      },
    };
  },
  async run() {
    const { secrets } = await import("./infra/secrets.js");
    const { storage } = await import("./infra/storage.js");
    const { queues } = await import("./infra/queues.js");
    const { database, databaseUrl } = await import("./infra/database.js");
    const { api } = await import("./infra/api.js");
    const { router } = await import("./infra/router.js");
    // waf must be imported before web — CloudFront needs the WebACL ARN
    const { wafWebAcl } = await import("./infra/waf.js");
    const { web } = await import("./infra/web.js");
    const { workers } = await import("./infra/workers.js");
    const { migrationFunction } = await import("./infra/migrate.js");
    const { seedAchievementsFunction, seedGeoFunction } = await import("./infra/seeds.js");
    // alarms depend on api + workers being defined first
    const { alarmTopic } = await import("./infra/alarms.js");

    return {
      api: api.url,
      apiRouter: router.url,
      web: web.url,
      dbHost: database.host,
      migrateFunction: migrationFunction.name,
      seedAchievementsFunction: seedAchievementsFunction.name,
      seedGeoFunction: seedGeoFunction.name,
      wafWebAclArn: wafWebAcl.arn,
      alarmTopicArn: alarmTopic.arn,
    };
  },
});
