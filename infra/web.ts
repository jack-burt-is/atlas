import { router } from "./router.js";
import { wafWebAcl } from "./waf.js";

const isProd = $app.stage === "prod";

// CloudFront response headers policy — CSP, HSTS, and other security headers.
// MapLibre GL JS requires:
//   worker-src blob:       (spawns Web Workers from blob URLs)
//   img-src blob: data:    (renders raster tiles as images)
//   connect-src <tile-host> (fetches vector tile JSON)
const responseHeadersPolicy = new aws.cloudfront.ResponseHeadersPolicy(
  "AtlasSecurityHeaders",
  {
    name: `atlas-security-headers-${$app.stage}`,
    securityHeadersConfig: {
      contentSecurityPolicy: {
        contentSecurityPolicy: $interpolate`default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; connect-src 'self' ${router.url} https://tiles.openfreemap.org; img-src 'self' blob: data: https://tiles.openfreemap.org; worker-src blob:; style-src 'self' 'unsafe-inline'; font-src 'self' data:`,
        override: true,
      },
      strictTransportSecurity: {
        accessControlMaxAgeSec: 63072000,
        includeSubdomains: true,
        preload: true,
        override: true,
      },
      contentTypeOptions: { override: true },
      frameOptions: {
        frameOption: "DENY",
        override: true,
      },
      xssProtection: {
        modeBlock: true,
        protection: true,
        override: true,
      },
    },
  },
);

export const web = new sst.aws.StaticSite("AtlasWeb", {
  path: "packages/web",
  build: {
    command: "pnpm build",
    output: "dist",
  },
  domain: isProd
    ? { name: "goatlas.co.uk", redirects: ["www.goatlas.co.uk"] }
    : undefined,
  environment: {
    VITE_API_URL: router.url,
    VITE_MAPLIBRE_STYLE: "https://tiles.openfreemap.org/styles/dark",
  },
  errorPage: "index.html",
  transform: {
    distribution: (args) => {
      // Attach WAF WebACL (must be created in us-east-1 for CloudFront scope)
      args.webAclId = wafWebAcl.arn;

      const applyHeaders = (behavior: { responseHeadersPolicyId?: $util.Input<string> }) => {
        behavior.responseHeadersPolicyId = responseHeadersPolicy.id;
      };

      if (args.defaultCacheBehavior) {
        applyHeaders(args.defaultCacheBehavior as { responseHeadersPolicyId?: $util.Input<string> });
      }
      if (Array.isArray(args.orderedCacheBehaviors)) {
        for (const behavior of args.orderedCacheBehaviors) {
          applyHeaders(behavior as { responseHeadersPolicyId?: $util.Input<string> });
        }
      }
    },
  },
});
