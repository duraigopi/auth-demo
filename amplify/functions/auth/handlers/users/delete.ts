/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import type { AuthValidatedContext } from "@backend/types/api";
import type { UserIdParam } from "@backend/types/auth";

/* Permanently delete the user, old sessions expire through their ttl */
export const remove = async (c: AuthValidatedContext<{ param: UserIdParam }>) => {
  const { userId } = c.req.valid("param");

  try {
    /* An admin can't delete their own account */
    if (userId === c.var.auth.userId) {
      const response = formatErrorResponse({
        message: "You cannot delete your own account.",
        error: ERROR_CODES.CANNOT_MODIFY_SELF,
      });
      return c.json(response, 400);
    }

    const { data: user } = await UserEntity
      .get({ user_id: userId })
      .go({
        attributes: ["user_id"],
      });
    if (!user) {
      const response = formatErrorResponse({
        message: "The user was not found.",
        error: ERROR_CODES.USER_NOT_FOUND,
      });
      return c.json(response, 404);
    }

    await UserEntity.delete({ user_id: userId }).go();

    const response = formatSuccessResponse({ message: "User deleted successfully." });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to delete user";
    logError({
      title: "[USERS-DELETE] 500: Failed to delete user",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to delete the user. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
