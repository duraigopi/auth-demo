/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { toPublicUser } from "@backend/utils/user";
import type { AuthValidatedContext } from "@backend/types/api";
import type { UserIdParam } from "@backend/types/auth";

export const get = async (c: AuthValidatedContext<{ param: UserIdParam }>) => {
  const { userId } = c.req.valid("param");

  try {
    const { data: user } = await UserEntity.get({ user_id: userId }).go();
    if (!user) {
      const response = formatErrorResponse({
        message: "The user was not found.",
        error: ERROR_CODES.USER_NOT_FOUND,
      });
      return c.json(response, 404);
    }

    const response = formatSuccessResponse({
      message: "User fetched successfully.",
      data: toPublicUser(user),
    });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch user";
    logError({
      title: "[USERS-GET] 500: Failed to fetch user",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to retrieve the user. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
