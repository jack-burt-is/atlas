import { handle } from "hono/aws-lambda";
import { injectLambdaContext } from "@aws-lambda-powertools/logger/middleware";
import { captureLambdaHandler } from "@aws-lambda-powertools/tracer/middleware";
import { logMetrics } from "@aws-lambda-powertools/metrics/middleware";
import middy from "@middy/core";
import app from "./app.js";
import { logger, tracer, metrics } from "./lib/powertools.js";

const honoHandler = handle(app);

export const handler = middy(honoHandler)
  .use(captureLambdaHandler(tracer))
  .use(injectLambdaContext(logger, { clearState: true }))
  .use(logMetrics(metrics, { captureColdStartMetric: true }));
