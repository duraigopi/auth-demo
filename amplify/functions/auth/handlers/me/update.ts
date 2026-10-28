/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import type { AuthValidatedContext } from "@backend/types/api";
import type { UpdateProfileFormData } from "@backend/types/auth";

export const update = async (c: AuthValidatedContext<{ json: UpdateProfileFormData }>) => {
  const { userId } = c.var.auth;
  const { name } = c.req.valid("json");

  try {
    /* authMiddleware already confirmed the user exists, so no read is needed first */
    await UserEntity
      .patch({ user_id: userId })
      .set({ name })
      .go();

    const response = formatSuccessResponse({ message: "Profile updated successfully." });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
    logError({
      title: "[ME-UPDATE] 500: Failed to update profile",
      data: { userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to update your profile. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
