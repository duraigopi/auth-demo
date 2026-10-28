/* Library imports */
import { posix } from "path";
import { defineBackend } from "@aws-amplify/backend";
import { CfnOutput } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";

/* Resource imports */
import { authFunction } from "./functions/auth/resource";

/* Backend module imports */
import { API_ROUTES } from "./backend/constants";

const backend = defineBackend({
  authFunction,
});

/* Own stack, so a function change never replaces the API and its URL */
const apiStack = backend.createStack("api-stack");

/* Same origins the Lambda allows; .env was already loaded by the function resource above */
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000").split(",").map((origin) => origin.trim());

/* HTTP API (v2) is cheaper than a REST API and matches the event format the Lambda reads. Browser preflight requests are answered here, so they never start the Lambda. */
const httpApi = new HttpApi(apiStack, "auth-api", {
  apiName: "auth-api",
  corsPreflight: {
    allowOrigins: allowedOrigins,
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS],
    allowHeaders: ["Content-Type", "Authorization"],
  },
});

/* One API Gateway route per path and method, all forwarding to the same Lambda */
API_ROUTES.forEach(({ basePath, routes }) => {
  const integration = new HttpLambdaIntegration(`${basePath}-integration`, backend.authFunction.resources.lambda);

  routes.forEach(({ path, methods }) => {
    /* Edge slashes are trimmed first, because API Gateway treats a trailing "/" as a different route */
    const fullPath = posix.join("/api/v1", basePath.replace(/^\/+|\/+$/g, ""), path.replace(/^\/+|\/+$/g, ""));
    httpApi.addRoutes({
      path: fullPath,
      methods,
      integration,
    });
  });
});

/* The base URL shows up in the stack outputs and in amplify_outputs.json for the frontend */
new CfnOutput(apiStack, "AuthApiUrl", { value: httpApi.apiEndpoint });
backend.addOutput({
  custom: {
    apiUrl: httpApi.apiEndpoint,
  },
});
