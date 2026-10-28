/* Library imports */
import { defineFunction } from "@aws-amplify/backend";

export const authFunction = defineFunction({
  name: "auth-function",
  entry: "handler.ts",
  timeoutSeconds: 30,
  runtime: 24,
});
