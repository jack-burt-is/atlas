function makeQueue(name: string, visibilityTimeout = 300) {
  const visibilityTimeoutDuration = `${visibilityTimeout} seconds`;

  const dlq = new sst.aws.Queue(`${name}Dlq`, {
    visibilityTimeout: visibilityTimeoutDuration,
  });

  const queue = new sst.aws.Queue(name, {
    visibilityTimeout: visibilityTimeoutDuration,
    dlq: {
      queue: dlq.arn,
      retry: 3,
    },
  });

  return { queue, dlq };
}

export const queues = {
  processActivity: makeQueue("ProcessActivity", 120),
  stravaSync: makeQueue("StravaSync", 300),
  email: makeQueue("Email"),
};
