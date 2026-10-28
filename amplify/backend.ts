/* Library imports */
import { posix } from "path";
import { defineBackend } from "@aws-amplify/backend";
import { CfnOutput, RemovalPolicy } from "aws-cdk-lib";
import { CorsHttpMethod, HttpApi } from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import { AttributeType, BillingMode, Table } from "aws-cdk-lib/aws-dynamodb";

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

/* Tables live in their own stack. Names, keys and index names must match the entities in functions/auth/entities. */
const dataStack = backend.createStack("data-stack");

const usersTable = new Table(dataStack, "UsersTable", {
  tableName: "Users",
  partitionKey: { name: "user_id", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  /* Demo setting: deleting the stack deletes the data. Use RETAIN once real accounts exist. */
  removalPolicy: RemovalPolicy.DESTROY,
});
usersTable.addGlobalSecondaryIndex({
  indexName: "email-index",
  partitionKey: { name: "email", type: AttributeType.STRING },
});

const sessionsTable = new Table(dataStack, "SessionsTable", {
  tableName: "Sessions",
  partitionKey: { name: "session_id", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  /* DynamoDB deletes a row once its ttl time (Unix seconds) has passed */
  timeToLiveAttribute: "ttl",
  removalPolicy: RemovalPolicy.DESTROY,
});
sessionsTable.addGlobalSecondaryIndex({
  indexName: "user_id-index",
  partitionKey: { name: "user_id", type: AttributeType.STRING },
});

const loginAttemptsTable = new Table(dataStack, "LoginAttemptsTable", {
  tableName: "LoginAttempts",
  partitionKey: { name: "email", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
  timeToLiveAttribute: "ttl",
  removalPolicy: RemovalPolicy.DESTROY,
});

/* Read and write access for the Lambda, including the indexes */
usersTable.grantReadWriteData(backend.authFunction.resources.lambda);
sessionsTable.grantReadWriteData(backend.authFunction.resources.lambda);
loginAttemptsTable.grantReadWriteData(backend.authFunction.resources.lambda);

/* The base URL shows up in the stack outputs and in amplify_outputs.json for the frontend */
new CfnOutput(apiStack, "AuthApiUrl", { value: httpApi.apiEndpoint });
backend.addOutput({
  custom: {
    apiUrl: httpApi.apiEndpoint,
  },
});
