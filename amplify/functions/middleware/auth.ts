/* Library imports */
import { createMiddleware } from "hono/factory";

/* Backend module imports */
import { TOKEN_TYPE } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";
import { verifyToken } from "@backend/utils/token";
import type { AuthEnv } from "@backend/types/api";
import type { UserRole } from "@backend/types/user";

/* Accepts only a valid, unexpired access token and records who the caller is for the handlers after it */
export const authenticate = createMiddleware<AuthEnv>(async (c, next) => {
  const header = c.req.header("Authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : undefined;

  try {
    if (!token) throw new Error("Missing token");
    const payload = await verifyToken(token);
    /* A refresh token is signed with the same key, so its type must be checked here */
    if (payload.typ !== TOKEN_TYPE.ACCESS) throw new Error("Wrong token type");
    c.set("auth", {
      userId: String(payload.sub),
      role: payload.role as UserRole,
      sessionId: String(payload.sid),
    });
  } catch {
    const response = formatErrorResponse({
      message: "Please log in to continue.",
      error: ERROR_CODES.UNAUTHORIZED,
    });
    return c.json(response, 401);
  }

  return next();
});
