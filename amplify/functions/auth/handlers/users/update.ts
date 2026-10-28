/* Backend module imports */
import { USER_ROLE } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import type { AuthValidatedContext } from "@backend/types/api";
import type { UpdateUserFormData, UserIdParam } from "@backend/types/auth";

export const update = async (c: AuthValidatedContext<{ param: UserIdParam; json: UpdateUserFormData }>) => {
  const { userId } = c.req.valid("param");
  const changes = c.req.valid("json");

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

    /* Stops an admin from demoting themselves, which could leave nobody able to manage users */
    const losesAdminAccess = changes.role !== undefined && changes.role !== USER_ROLE.ADMIN;
    if (userId === c.var.auth.userId && losesAdminAccess) {
      const response = formatErrorResponse({
        message: "You cannot remove your own admin access.",
        error: ERROR_CODES.CANNOT_MODIFY_SELF,
      });
      return c.json(response, 400);
    }

    await UserEntity
      .patch({ user_id: userId })
      .set(changes)
      .go();

    const response = formatSuccessResponse({ message: "User updated successfully." });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update user";
    logError({
      title: "[USERS-UPDATE] 500: Failed to update user",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to update the user. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
