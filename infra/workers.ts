import { queues } from "./queues.js";
import { storage } from "./storage.js";
import { databaseUrl } from "./database.js";
import { vpc } from "./network.js";

export const workers = {
  processActivity: new sst.aws.Function("WorkerProcessActivity", {
    handler: "packages/workers/src/handlers/process-activity.handler",
    runtime: "nodejs22.x",
    memory: "512 MB",
    timeout: "2 minutes",
    vpc,
    environment: {
      STAGE: $app.stage,
      DATABASE_URL: databaseUrl,
      UPLOADS_BUCKET: storage.uploads.name,
    },
    link: [storage.uploads, queues.processActivity.queue],
  }),
};

// Wire SQS → Lambda subscriptions
queues.processActivity.queue.subscribe(workers.processActivity.arn);
