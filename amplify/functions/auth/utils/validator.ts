/* Library imports */
import { zValidator } from "@hono/zod-validator";
import type { ZodType } from "zod/v4";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";

/* Validates a JSON body and replies with the standard error body instead of the raw Zod issues */
export const jsonValidator = <T extends ZodType>(schema: T) =>
  zValidator("json", schema, (result, c) => {
    if (result.success) return undefined;
    const response = formatErrorResponse({
      message: "Please check the details you entered and try again.",
      error: ERROR_CODES.VALIDATION_FAILED,
      validation_errors: result.error.issues.map((issue) => ({
        path: issue.path.map(String).join("."),
        message: issue.message,
      })),
    });
    return c.json(response, 400);
  });
