/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import type { AuthValidatedContext } from "@backend/types/api";
import type { UserIdParam } from "@backend/types/auth";

/* Lets a disabled user sign in again */
export const enable = async (c: AuthValidatedContext<{ param: UserIdParam }>) => {
  const { userId } = c.req.valid("param");

  try {
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

    await UserEntity
      .patch({ user_id: userId })
      .set({ is_active: true })
      .go();

    const response = formatSuccessResponse({ message: "User enabled successfully." });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to enable user";
    logError({
      title: "[USERS-ENABLE] 500: Failed to enable user",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to enable the user. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
