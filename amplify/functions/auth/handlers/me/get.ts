/* Library imports */
import type { Context } from "hono";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { toPublicUser } from "@backend/utils/user";
import type { AuthEnv } from "@backend/types/api";

export const get = async (c: Context<AuthEnv>) => {
  const { userId } = c.var.auth;

  try {
    const { data: user } = await UserEntity
      .get({ user_id: userId })
      .go({
        attributes: ["user_id", "email", "name", "role", "is_active", "created_at"],
      });
    if (!user) {
      const response = formatErrorResponse({
        message: "The user was not found.",
        error: ERROR_CODES.USER_NOT_FOUND,
      });
      return c.json(response, 404);
    }

    const response = formatSuccessResponse({
      message: "Profile fetched successfully.",
      data: toPublicUser(user),
    });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch profile";
    logError({
      title: "[ME-GET] 500: Failed to fetch profile",
      data: { userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to retrieve your profile. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
