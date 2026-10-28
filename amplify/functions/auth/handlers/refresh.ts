/* Library imports */
import type { Context } from "hono";
import { nanoid } from "nanoid";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { SessionEntity } from "@backend/entities/session";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { getUnixTimestamp } from "@backend/utils/time-calculations";
import { createAccessToken, createRefreshToken, verifyRefreshToken } from "@backend/utils/token";
import { toPublicUser } from "@backend/utils/user";

export const refresh = async (c: Context) => {
  /* The refresh token is sent in the Authorization header, like every other token */
  const authorization = c.req.header("Authorization");
  const token = authorization?.startsWith("Bearer ") ? authorization.slice(7) : undefined;

  const sessionEnded = () => {
    const response = formatErrorResponse({
      message: "Your session has ended. Please log in again.",
      error: ERROR_CODES.INVALID_REFRESH_TOKEN,
    });
    return c.json(response, 401);
  };

  try {
    if (!token) return sessionEnded();

    /* Check the signature and that this is a refresh token */
    const payload = await verifyRefreshToken(token);
    if (!payload) return sessionEnded();

    /* Consistent read, so a token that was just rotated can't be accepted again */
    const [{ data: session }, { data: user }] = await Promise.all([
      SessionEntity
        .get({ session_id: String(payload.sid) })
        .go({
          consistent: true,
          attributes: ["session_id", "user_id", "refresh_token", "is_revoked", "ttl"],
        }),
      UserEntity
        .get({ user_id: String(payload.sub) })
        .go({
          attributes: ["user_id", "email", "name", "role", "is_active"],
        }),
    ]);

    /* The session must be active, belong to this user and match the latest refresh token */
    if (
      !session
      || !user
      || !user.is_active
      || session.is_revoked
      || session.ttl <= getUnixTimestamp()
      || session.user_id !== payload.sub
      || session.refresh_token !== payload.jti
    ) {
      return sessionEnded();
    }

    /* Rotate the token with a conditional update, so only one of two concurrent refreshes succeeds */
    const tokenId = nanoid();
    try {
      await SessionEntity
        .patch({ session_id: session.session_id })
        .set({ refresh_token: tokenId })
        .where(({ refresh_token }, { eq }) => eq(refresh_token, session.refresh_token))
        .go();
    } catch (error) {
      /* If the stored token id is unchanged, the update failed for another reason, which is not a reuse */
      const { data: latest } = await SessionEntity
        .get({ session_id: session.session_id })
        .go({
          consistent: true,
          attributes: ["refresh_token"],
        });
      if (latest?.refresh_token === session.refresh_token) throw error;

      /* The token was already used, which could mean it was copied, so end the session */
      await SessionEntity
        .patch({ session_id: session.session_id })
        .set({ is_revoked: true })
        .go();
      return sessionEnded();
    }

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken({
        userId: user.user_id,
        role: user.role,
        sessionId: session.session_id,
      }),
      createRefreshToken({
        userId: user.user_id,
        sessionId: session.session_id,
        tokenId,
      }),
    ]);

    const response = formatSuccessResponse({
      message: "Session refreshed successfully.",
      data: {
        accessToken,
        refreshToken,
        user: toPublicUser(user),
      },
    });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to refresh session";
    logError({
      title: "[AUTH-REFRESH] 500: Failed to refresh session",
      data: { error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to refresh your session. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
