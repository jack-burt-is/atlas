import { queues } from "./queues.js";
import { api } from "./api.js";
import { workers } from "./workers.js";

const alarmTopic = new aws.sns.Topic("AtlasAlarms", {
  name: `atlas-alarms-${$app.stage}`,
});

const alarmEmail = process.env["ALARM_EMAIL"];
if (alarmEmail) {
  new aws.sns.TopicSubscription("AlarmEmailSub", {
    topic: alarmTopic.arn,
    protocol: "email",
    endpoint: alarmEmail,
  });
}

// ─── DLQ depth alarms ────────────────────────────────────────────────────────

const dlqNames: Array<[string, $util.Output<string>]> = [
  ["ProcessActivity", queues.processActivity.dlq.arn],
  ["StravaSync", queues.stravaSync.dlq.arn],
  ["Email", queues.email.dlq.arn],
];

for (const [name, dlqArn] of dlqNames) {
  const queueName = dlqArn.apply((arn) => arn.split(":").pop() ?? "");

  new aws.cloudwatch.MetricAlarm(`DlqDepth${name}`, {
    name: `atlas-${$app.stage}-dlq-depth-${name.toLowerCase()}`,
    comparisonOperator: "GreaterThanThreshold",
    evaluationPeriods: 1,
    metricName: "ApproximateNumberOfMessagesVisible",
    namespace: "AWS/SQS",
    period: 60,
    statistic: "Sum",
    threshold: 5,
    alarmDescription: `DLQ ${name} has more than 5 messages`,
    alarmActions: [alarmTopic.arn],
    okActions: [alarmTopic.arn],
    dimensions: { QueueName: queueName },
    treatMissingData: "notBreaching",
  });
}

// ─── Lambda error rate alarms ─────────────────────────────────────────────────

const lambdaFunctions: Array<[string, $util.Output<string>]> = [
  ["ApiHandler", api.name],
  ["WorkerProcessActivity", workers.processActivity.name],
];

for (const [label, fnName] of lambdaFunctions) {
  new aws.cloudwatch.MetricAlarm(`LambdaErrors${label}`, {
    name: `atlas-${$app.stage}-lambda-errors-${label.toLowerCase()}`,
    comparisonOperator: "GreaterThanThreshold",
    evaluationPeriods: 1,
    metricQueries: [
      {
        id: "errors",
        metric: {
          metricName: "Errors",
          namespace: "AWS/Lambda",
          period: 300,
          stat: "Sum",
          dimensions: { FunctionName: fnName },
        },
      },
      {
        id: "invocations",
        metric: {
          metricName: "Invocations",
          namespace: "AWS/Lambda",
          period: 300,
          stat: "Sum",
          dimensions: { FunctionName: fnName },
        },
      },
      {
        id: "error_rate",
        expression: "IF(invocations > 0, errors / invocations * 100, 0)",
        label: "Error Rate %",
        returnData: true,
      },
    ],
    threshold: 1,
    alarmDescription: `${label} error rate > 1%`,
    alarmActions: [alarmTopic.arn],
    okActions: [alarmTopic.arn],
    treatMissingData: "notBreaching",
  });
}

// ─── Aurora connections alarm ─────────────────────────────────────────────────

new aws.cloudwatch.MetricAlarm("AuroraConnections", {
  name: `atlas-${$app.stage}-aurora-connections`,
  comparisonOperator: "GreaterThanThreshold",
  evaluationPeriods: 2,
  metricName: "DatabaseConnections",
  namespace: "AWS/RDS",
  period: 60,
  statistic: "Maximum",
  threshold: 900,
  alarmDescription: "Aurora connection count approaching limit",
  alarmActions: [alarmTopic.arn],
  okActions: [alarmTopic.arn],
  treatMissingData: "notBreaching",
});

export { alarmTopic };
