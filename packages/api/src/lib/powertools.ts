import { Logger } from "@aws-lambda-powertools/logger";
import { Tracer } from "@aws-lambda-powertools/tracer";
import { Metrics, MetricUnit } from "@aws-lambda-powertools/metrics";

const SERVICE = "atlas-api";
const STAGE = process.env["STAGE"] ?? "dev";

export const logger = new Logger({
  serviceName: SERVICE,
  logLevel: STAGE === "prod" ? "INFO" : "DEBUG",
  persistentLogAttributes: { stage: STAGE },
});

export const tracer = new Tracer({ serviceName: SERVICE });

export const metrics = new Metrics({
  namespace: "Atlas",
  serviceName: SERVICE,
});

export { MetricUnit };

export function addRequestContext(ctx: { userId?: string; path?: string }) {
  if (ctx.userId) logger.appendKeys({ userId: ctx.userId });
  if (ctx.path) logger.appendKeys({ path: ctx.path });
}
