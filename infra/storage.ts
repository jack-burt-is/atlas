export const storage = {
  uploads: new sst.aws.Bucket("AtlasUploads", {
    cors: {
      allowMethods: ["GET", "PUT", "POST"],
      allowOrigins: ["*"],
      allowHeaders: ["*"],
      maxAge: "3000 seconds",
    },
    transform: {
      bucket: {
        serverSideEncryptionConfiguration: {
          rules: [
            {
              applyServerSideEncryptionByDefault: {
                sseAlgorithm: "AES256",
              },
            },
          ],
        },
        lifecycleRules: [
          {
            id: "expire-raw-uploads",
            enabled: true,
            expirations: [{ days: 7 }],
          },
        ],
      },
    },
  }),
};
