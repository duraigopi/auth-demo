/* Library imports */
import { nanoid } from "nanoid";

/* Backend module imports */
import { AUTH_CONFIG } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { LoginAttemptEntity } from "@backend/entities/login-attempt";
import { SessionEntity } from "@backend/entities/session";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { verifyPassword } from "@backend/utils/password";
import { addDaysToUnixTimestamp, addMinutesToISOString, isISOExpired } from "@backend/utils/time-calculations";
import { createAccessToken, createRefreshToken } from "@backend/utils/token";
import { toPublicUser } from "@backend/utils/user";
import type { ValidatedJsonContext } from "@backend/types/api";
import type { LoginFormData } from "@backend/types/auth";

export const login = async (c: ValidatedJsonContext<LoginFormData>) => {
  const { email, password } = c.req.valid("json");

  /* Independent reads, so they run together instead of one after the other */
  const [{ data: attempt }, { data: users }] = await Promise.all([
    LoginAttemptEntity.get({ email }).go(),
    UserEntity.query.byEmail({ email }).go(),
  ]);
  const user = users[0];

  if (attempt?.locked_until && !isISOExpired(attempt.locked_until)) {
    const response = formatErrorResponse({
      message: "Too many failed attempts. Please try again later.",
      error: ERROR_CODES.ACCOUNT_LOCKED,
    });
    return c.json(response, 429);
  }

  /* An unknown email and a wrong password get the same reply, so the response never reveals which emails exist */
  const isPasswordValid = user ? await verifyPassword(password, user.password_hash) : false;
  if (!user || !isPasswordValid) {
    /* Atomic add, so two simultaneous wrong passwords both count */
    const { data: updated } = await LoginAttemptEntity.update({ email })
      .add({ failed_count: 1 })
      .set({ ttl: addDaysToUnixTimestamp(AUTH_CONFIG.LOGIN_ATTEMPT_TTL_DAYS) })
      .go({ response: "all_new" });
    if ((updated.failed_count ?? 0) >= AUTH_CONFIG.MAX_FAILED_ATTEMPTS) {
      await LoginAttemptEntity.update({ email })
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

  /* Told only after the password is right, so this reply cannot be used to find out which emails exist */
  if (!user.is_active) {
    const response = formatErrorResponse({
      message: "Your account is inactive. Please contact the admin.",
      error: ERROR_CODES.ACCOUNT_INACTIVE,
    });
    return c.json(response, 403);
  }

  const sessionId = nanoid();
  const tokenId = nanoid();

  /* Independent writes, so they run together */
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
};
