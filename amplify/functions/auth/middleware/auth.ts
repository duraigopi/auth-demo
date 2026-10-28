/* Library imports */
import type { Context, Next } from "hono";

/* Backend module imports */
import { TOKEN_TYPE } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { verifyToken } from "@backend/utils/token";
import type { AuthEnv } from "@backend/types/api";
import type { UserRole } from "@backend/types/auth";

export const authMiddleware = async (c: Context<AuthEnv>, next: Next) => {
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  if (!token) {
    const response = formatErrorResponse({
      message: "Authorization token is required.",
      error: ERROR_CODES.UNAUTHORIZED,
    });
    return c.json(response, 401);
  }

  try {
    const payload = await verifyToken(token);

    if (payload.typ !== TOKEN_TYPE.ACCESS) {
      const response = formatErrorResponse({
        message: "Invalid authorization token.",
        error: ERROR_CODES.UNAUTHORIZED,
      });
      return c.json(response, 401);
    }

    c.set("auth", {
      userId: String(payload.sub),
      role: payload.role as UserRole,
      sessionId: String(payload.sid),
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to verify authorization token";
    logError({
      title: "[AUTH-MIDDLEWARE]: Failed to verify token",
      data: { error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Invalid or expired authorization token.",
      error: ERROR_CODES.UNAUTHORIZED,
    });
    return c.json(response, 401);
  }

  return next();
};
