/* Library imports */
import type { Context } from "hono";

/* Backend module imports */
import { SessionEntity } from "@backend/entities/session";
import { formatSuccessResponse } from "@backend/utils/api-response";
import type { AuthEnv } from "@backend/types/api";

export const logout = async (c: Context<AuthEnv>) => {
  const { sessionId } = c.var.auth;

  /* The refresh token stops working at once; the access token still lives until it expires, at most 15 minutes */
  await SessionEntity.patch({ session_id: sessionId })
    .set({ is_revoked: true })
    .go();

  const response = formatSuccessResponse({ message: "Logged out successfully." });
  return c.json(response, 200);
};
