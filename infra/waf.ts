// WAF WebACL — CLOUDFRONT scope requires us-east-1.
// SST/Pulumi providers default to eu-west-2, so we create a provider override.
const usEast1 = new aws.Provider("UsEast1", { region: "us-east-1" });

/**
 * WAF rules:
 * 1. IP-level rate limit: 2000 req / 5 min per IP
 * 2. AWS Bot Control managed rule group
 * 3. AWS SQLi managed rule group
 * 4. AWS Core Rule Set (covers XSS)
 */
export const wafWebAcl = new aws.wafv2.WebAcl(
  "AtlasWebAcl",
  {
    scope: "CLOUDFRONT",
    defaultAction: { allow: {} },
    visibilityConfig: {
      cloudwatchMetricsEnabled: true,
      metricName: "AtlasWebAcl",
      sampledRequestsEnabled: true,
    },
    rules: [
      {
        name: "IpRateLimit",
        priority: 1,
        action: { block: {} },
        visibilityConfig: {
          cloudwatchMetricsEnabled: true,
          metricName: "IpRateLimit",
          sampledRequestsEnabled: true,
        },
        statement: {
          rateBasedStatement: {
            limit: 2000,
            aggregateKeyType: "IP",
          },
        },
      },
      {
        name: "BotControl",
        priority: 2,
        overrideAction: { none: {} },
        visibilityConfig: {
          cloudwatchMetricsEnabled: true,
          metricName: "BotControl",
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: {
            name: "AWSManagedRulesBotControlRuleSet",
            vendorName: "AWS",
            managedRuleGroupConfigs: [
              {
                awsManagedRulesBotControlRuleSet: {
                  inspectionLevel: "COMMON",
                },
              },
            ],
          },
        },
      },
      {
        name: "SqlInjection",
        priority: 3,
        overrideAction: { none: {} },
        visibilityConfig: {
          cloudwatchMetricsEnabled: true,
          metricName: "SqlInjection",
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: {
            name: "AWSManagedRulesSQLiRuleSet",
            vendorName: "AWS",
          },
        },
      },
      {
        name: "CoreRuleSet",
        priority: 4,
        overrideAction: { none: {} },
        visibilityConfig: {
          cloudwatchMetricsEnabled: true,
          metricName: "CoreRuleSet",
          sampledRequestsEnabled: true,
        },
        statement: {
          managedRuleGroupStatement: {
            name: "AWSManagedRulesCommonRuleSet",
            vendorName: "AWS",
          },
        },
      },
    ],
  },
  { provider: usEast1 },
);
