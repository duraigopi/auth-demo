/* Library imports */
import { defineBackend } from "@aws-amplify/backend";

/* Resource imports */
import { authFunction } from "./functions/auth/resource";

defineBackend({
  authFunction,
});
