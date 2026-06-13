export const vpc = new sst.aws.Vpc("AtlasVpc", {
  nat: "ec2",
});
