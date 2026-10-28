/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { SessionEntity } from "@backend/entities/session";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { hashPassword, verifyPassword } from "@backend/utils/password";
import type { AuthValidatedContext } from "@backend/types/api";
import type { ChangePasswordFormData } from "@backend/types/auth";

export const changePassword = async (c: AuthValidatedContext<{ json: ChangePasswordFormData }>) => {
  const { userId, sessionId } = c.var.auth;
  const { current_password, new_password } = c.req.valid("json");

  try {
    const { data: user } = await UserEntity
      .get({ user_id: userId })
      .go({
        attributes: ["user_id", "password_hash"],
      });
    if (!user) {
      const response = formatErrorResponse({
        message: "The user was not found.",
        error: ERROR_CODES.USER_NOT_FOUND,
      });
      return c.json(response, 404);
    }

    /* The current password has to be right, so a stolen access token isn't enough */
    const isCurrentPasswordValid = await verifyPassword(current_password, user.password_hash);
    if (!isCurrentPasswordValid) {
      const response = formatErrorResponse({
        message: "Your current password is incorrect.",
        error: ERROR_CODES.INVALID_CREDENTIALS,
      });
      return c.json(response, 400);
    }

    const passwordHash = await hashPassword(new_password);
    /* Save the new password and look up the other active sessions at the same time */
    const [, { data: sessions }] = await Promise.all([
      UserEntity
        .patch({ user_id: userId })
        .set({ password_hash: passwordHash })
        .go(),
      SessionEntity
        .query.byUser({ user_id: userId })
        .where(({ is_revoked }, { eq }) => eq(is_revoked, false))
        .go({
          pages: "all",
          attributes: ["session_id"],
        }),
    ]);

    /* Sign out the other sessions, the current one stays signed in */
    await Promise.all(
      sessions
        .filter((session) => session.session_id !== sessionId)
        .map((session) => SessionEntity.patch({ session_id: session.session_id }).set({ is_revoked: true }).go()),
    );

    const response = formatSuccessResponse({ message: "Password changed successfully." });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to change password";
    logError({
      title: "[ME-CHANGE-PASSWORD] 500: Failed to change password",
      data: { userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to change your password. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
