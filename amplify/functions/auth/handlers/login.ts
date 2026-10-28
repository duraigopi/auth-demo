/* Library imports */
import { nanoid } from "nanoid";

/* Backend module imports */
import { AUTH_CONFIG } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { LoginAttemptEntity } from "@backend/entities/login-attempt";
import { SessionEntity } from "@backend/entities/session";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { verifyPassword } from "@backend/utils/password";
import { addDaysToUnixTimestamp, addMinutesToISOString, isISOExpired } from "@backend/utils/time-calculations";
import { createAccessToken, createRefreshToken } from "@backend/utils/token";
import { toPublicUser } from "@backend/utils/user";
import type { ValidatedJsonContext } from "@backend/types/api";
import type { LoginFormData } from "@backend/types/auth";

export const login = async (c: ValidatedJsonContext<LoginFormData>) => {
  const { email, password } = c.req.valid("json");

  try {
    const [{ data: attempt }, { data: users }] = await Promise.all([
      LoginAttemptEntity
        .get({ email })
        .go({
          attributes: ["locked_until"],
        }),
      UserEntity
        .query.byEmail({ email })
        .go({
          attributes: ["user_id", "email", "name", "role", "is_active", "created_at", "password_hash"],
        }),
    ]);
    const user = users[0];

    /* A locked account can't log in until the lock expires */
    if (attempt?.locked_until && !isISOExpired(attempt.locked_until)) {
      const response = formatErrorResponse({
        message: "Too many failed attempts. Please try again later.",
        error: ERROR_CODES.ACCOUNT_LOCKED,
      });
      return c.json(response, 429);
    }

    /* An unknown email gets the same response as a wrong password, so emails can't be enumerated */
    const isPasswordValid = user ? await verifyPassword(password, user.password_hash) : false;
    if (!user || !isPasswordValid) {
      /* Atomic increment so concurrent failures are all counted */
      const { data: updated } = await LoginAttemptEntity
        .update({ email })
        .add({ failed_count: 1 })
        .set({ ttl: addDaysToUnixTimestamp(AUTH_CONFIG.LOGIN_ATTEMPT_TTL_DAYS) })
        .go({ response: "all_new" });
      /* Lock the account once the limit is reached */
      if ((updated.failed_count ?? 0) >= AUTH_CONFIG.MAX_FAILED_ATTEMPTS) {
        await LoginAttemptEntity
          .update({ email })
          .set({
            locked_until: addMinutesToISOString(AUTH_CONFIG.LOCKOUT_MINUTES),
            failed_count: 0,
          })
          .go();
      }
      const response = formatErrorResponse({
        message: "Incorrect email or password. Please try again.",
        error: ERROR_CODES.INVALID_CREDENTIALS,
      });
      return c.json(response, 401);
    }

    /* Only shown after a correct password, so it doesn't reveal which emails exist */
    if (!user.is_active) {
      const response = formatErrorResponse({
        message: "Your account is inactive. Please contact the admin.",
        error: ERROR_CODES.ACCOUNT_INACTIVE,
      });
      return c.json(response, 403);
    }

    const sessionId = nanoid();
    const tokenId = nanoid();

    /* Clear the earlier failed attempts and create the session */
    await Promise.all([
      LoginAttemptEntity.delete({ email }).go(),
      SessionEntity.create({
        session_id: sessionId,
        user_id: user.user_id,
        refresh_token: tokenId,
        ttl: addDaysToUnixTimestamp(AUTH_CONFIG.SESSION_DAYS),
      }).go(),
    ]);

    const [accessToken, refreshToken] = await Promise.all([
      createAccessToken({
        userId: user.user_id,
        role: user.role,
        sessionId,
      }),
      createRefreshToken({
        userId: user.user_id,
        sessionId,
        tokenId,
      }),
    ]);

    const response = formatSuccessResponse({
      message: "Logged in successfully.",
      data: {
        accessToken,
        refreshToken,
        user: toPublicUser(user),
      },
    });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to log in";
    logError({
      title: "[AUTH-LOGIN] 500: Failed to log in",
      data: { error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to log in. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
