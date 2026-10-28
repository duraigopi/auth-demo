/* Library imports */
import type { Context } from "hono";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { SessionEntity } from "@backend/entities/session";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import type { AuthEnv } from "@backend/types/api";

export const logout = async (c: Context<AuthEnv>) => {
  const { sessionId } = c.var.auth;

  try {
    /* Revoke the session so its refresh token stops working */
    await SessionEntity
      .patch({ session_id: sessionId })
      .set({ is_revoked: true })
      .go();

    const response = formatSuccessResponse({ message: "Logged out successfully." });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to log out";
    logError({
      title: "[AUTH-LOGOUT] 500: Failed to log out",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to log out. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
