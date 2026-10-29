/* Library imports */
import type { Context, Next } from "hono";
import type { JWTPayload } from "hono/utils/jwt/types";

/* Backend module imports */
import { TOKEN_TYPE } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { SessionEntity } from "@backend/entities/session";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { getUnixTimestamp } from "@backend/utils/time-calculations";
import { verifyToken } from "@backend/utils/token";
import type { AuthEnv } from "@backend/types/api";

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

  let payload: JWTPayload;
  try {
    payload = await verifyToken(token);
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

  /* Refresh tokens use the same key, so the token type has to be checked */
  if (payload.typ !== TOKEN_TYPE.ACCESS) {
    const response = formatErrorResponse({
      message: "Invalid authorization token.",
      error: ERROR_CODES.UNAUTHORIZED,
    });
    return c.json(response, 401);
  }

  const userId = String(payload.sub);
  const sessionId = String(payload.sid);

  /* Check the user and session on every request so disabling or logout works right away */
  const [{ data: session }, { data: user }] = await Promise.all([
    SessionEntity
      .get({ session_id: sessionId })
      .go({
        attributes: ["session_id", "user_id", "is_revoked", "ttl"],
      }),
    UserEntity
      .get({ user_id: userId })
      .go({
        attributes: ["user_id", "role", "is_active"],
      }),
  ]);

  if (
    !session
    || !user
    || !user.is_active
    || session.is_revoked
    || session.ttl <= getUnixTimestamp()
    || session.user_id !== userId
  ) {
    const response = formatErrorResponse({
      message: "Your session has ended. Please log in again.",
      error: ERROR_CODES.UNAUTHORIZED,
    });
    return c.json(response, 401);
  }

  /* The role comes from the database, not the token, so a demotion applies straight away */
  c.set("auth", { userId, role: user.role, sessionId });

  return next();
};
