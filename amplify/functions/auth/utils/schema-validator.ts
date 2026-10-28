/* Library imports */
import type { ValidationTargets } from "hono";
import type { $ZodType } from "zod/v4/core";
import { zValidator } from "@hono/zod-validator";

/* Backend module imports */
import { ERROR_CODES, ERROR_MESSAGES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";

/* Validates a request part (json, param or query) and returns our error body when it fails */
export const zValidatorWrapper = <T extends $ZodType, Target extends keyof ValidationTargets>(target: Target, schema: T) =>
  zValidator(target, schema, (result, c) => {
    if (result.success === false) {
      const response = formatErrorResponse({
        message: ERROR_MESSAGES.VALIDATION_ERROR,
        error: ERROR_CODES.VALIDATION_ERROR,
        validation_errors: result.error.issues.map((issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        })),
      });
      return c.json(response, 400);
    }
    return undefined;
  });
