/* Admin middleware, lets only admins through; it must come after the auth middleware */

/* Library imports */
import type { Context, Next } from "hono";

/* Backend module imports */
import { USER_ROLE } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";
import type { AuthEnv } from "@backend/types/api";

export const adminMiddleware = async (c: Context<AuthEnv>, next: Next) => {
  if (c.var.auth.role !== USER_ROLE.ADMIN) {
    const response = formatErrorResponse({
      message: "You do not have permission to access this resource.",
      error: ERROR_CODES.FORBIDDEN,
    });
    return c.json(response, 403);
  }

  return next();
};
