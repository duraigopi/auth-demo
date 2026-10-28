/* Library imports */
import "dotenv/config";
import { defineFunction } from "@aws-amplify/backend";

export const authFunction = defineFunction({
  name: "auth-function",
  entry: "handler.ts",
  timeoutSeconds: 30,
  runtime: 24,
  environment: {
    JWT_SECRET: process.env.JWT_SECRET ?? "",
    CORS_ALLOWED_ORIGINS: process.env.CORS_ALLOWED_ORIGINS ?? "",
  },
});
