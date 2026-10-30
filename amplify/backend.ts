/* Library imports */
import { posix } from "path";
import { defineBackend } from "@aws-amplify/backend";
import { CfnOutput, Duration, RemovalPolicy } from "aws-cdk-lib";
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

/* Separate stack so a function change doesn't replace the API URL */
const apiStack = backend.createStack("api-stack");

/* Same origins the Lambda allows */
const allowedOrigins = (process.env.CORS_ALLOWED_ORIGINS || "http://localhost:3000").split(",").map((origin) => origin.trim());

/* HTTP API is cheaper than REST and answers CORS preflight itself */
const httpApi = new HttpApi(apiStack, "auth-api", {
  apiName: "auth-api",
  corsPreflight: {
    allowOrigins: allowedOrigins,
    allowMethods: [CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS],
    allowHeaders: ["Content-Type", "Authorization"],
    maxAge: Duration.days(1),
  },
});

/* One route per path and method, all go to the same Lambda */
API_ROUTES.forEach(({ basePath, routes }) => {
  const integration = new HttpLambdaIntegration(`${basePath}-integration`, backend.authFunction.resources.lambda);

  routes.forEach(({ path, methods }) => {
    /* Trim edge slashes, a trailing "/" is a different route */
    const fullPath = posix.join("/api/v1", basePath.replace(/^\/+|\/+$/g, ""), path.replace(/^\/+|\/+$/g, ""));
    httpApi.addRoutes({
      path: fullPath,
      methods,
      integration,
    });
  });
});

/* Tables in their own stack, names and keys must match the entities */
const dataStack = backend.createStack("data-stack");

const usersTable = new Table(dataStack, "UsersTable", {
  tableName: "Users",
  partitionKey: { name: "user_id", type: AttributeType.STRING },
  billingMode: BillingMode.PAY_PER_REQUEST,
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

/* Lambda gets read and write access, indexes included */
usersTable.grantReadWriteData(backend.authFunction.resources.lambda);
sessionsTable.grantReadWriteData(backend.authFunction.resources.lambda);
loginAttemptsTable.grantReadWriteData(backend.authFunction.resources.lambda);

/* The API URL goes to the stack outputs and amplify_outputs.json */
new CfnOutput(apiStack, "AuthApiUrl", { value: httpApi.apiEndpoint });
backend.addOutput({
  custom: {
    API: {
      api: {
        endpoint: httpApi.apiEndpoint,
        region: apiStack.region,
      },
    },
  },
});
