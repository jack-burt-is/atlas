import {
  SQSClient,
  SendMessageCommand,
} from "@aws-sdk/client-sqs";

const sqs = new SQSClient({});

interface EmailMessage {
  template: string;
  to: string;
  subject: string;
  props: Record<string, unknown>;
}

export async function enqueueEmail(msg: EmailMessage): Promise<void> {
  const queueUrl = process.env["EMAIL_QUEUE_URL"];
  if (!queueUrl) {
    console.log("[email] queue not configured, skipping:", msg.template, msg.to);
    return;
  }
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(msg),
    }),
  );
}

interface ProcessActivityMessage {
  activityId: string;
  userId: string;
  s3Key: string;
}

export async function enqueueProcessActivity(msg: ProcessActivityMessage): Promise<void> {
  const queueUrl = process.env["PROCESS_ACTIVITY_QUEUE_URL"];
  if (!queueUrl) {
    console.log("[process-activity] queue not configured, skipping:", msg.activityId);
    return;
  }
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(msg),
    }),
  );
}

interface StravaSyncMessage {
  type: "full_sync";
  userId: string;
}

export async function enqueueStravaSync(msg: StravaSyncMessage): Promise<void> {
  const queueUrl = process.env["STRAVA_SYNC_QUEUE_URL"];
  if (!queueUrl) {
    console.log("[strava-sync] queue not configured, skipping:", msg.userId);
    return;
  }
  await sqs.send(
    new SendMessageCommand({
      QueueUrl: queueUrl,
      MessageBody: JSON.stringify(msg),
    }),
  );
}
