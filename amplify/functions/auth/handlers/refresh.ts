/* Library imports */
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
import type { ValidatedJsonContext } from "@backend/types/api";
import type { RefreshFormData } from "@backend/types/auth";

export const refresh = async (c: ValidatedJsonContext<RefreshFormData>) => {
  const { token } = c.req.valid("json");

  /* Every way a refresh token can be wrong gets the same reply, so nothing is revealed about which part failed */
  const sessionEnded = () => {
    const response = formatErrorResponse({
      message: "Your session has ended. Please log in again.",
      error: ERROR_CODES.INVALID_REFRESH_TOKEN,
    });
    return c.json(response, 401);
  };

  try {
    const payload = await verifyRefreshToken(token);
    if (!payload) return sessionEnded();

    /* Independent reads, so they run together; the consistent read makes sure a token that was just replaced is never accepted */
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

    /* The swap only succeeds while the stored token id is still the one just checked, so two simultaneous refreshes cannot both win */
    const tokenId = nanoid();
    try {
      await SessionEntity
        .patch({ session_id: session.session_id })
        .set({ refresh_token: tokenId })
        .where(({ refresh_token }, { eq }) => eq(refresh_token, session.refresh_token))
        .go();
    } catch {
      /* Someone else already used this token, so it may have been copied; the whole session is ended */
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
