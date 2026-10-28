/* Library imports */
import { sign, verify } from "hono/jwt";

/* Backend module imports */
import { JWT_SECRET } from "@backend/config/env";
import { AUTH_CONFIG, TOKEN_TYPE } from "@backend/constants/auth";
import { addDaysToUnixTimestamp, addMinutesToUnixTimestamp, getUnixTimestamp } from "@backend/utils/time-calculations";
import type { UserRole } from "@backend/types/auth";

/* Creates the short-lived access token */
export const createAccessToken = ({ userId, role, sessionId }: {
  userId: string;
  role: UserRole;
  sessionId: string;
}): Promise<string> => sign({
  typ: TOKEN_TYPE.ACCESS,
  sub: userId,
  role,
  sid: sessionId,
  iat: getUnixTimestamp(),
  exp: addMinutesToUnixTimestamp(AUTH_CONFIG.ACCESS_TOKEN_MINUTES),
}, JWT_SECRET);

/* Refresh token, jti must match the session's refresh_token so each refresh invalidates the previous one */
export const createRefreshToken = ({ userId, sessionId, tokenId }: {
  userId: string;
  sessionId: string;
  tokenId: string;
}): Promise<string> => sign({
  typ: TOKEN_TYPE.REFRESH,
  sub: userId,
  sid: sessionId,
  jti: tokenId,
  iat: getUnixTimestamp(),
  exp: addDaysToUnixTimestamp(AUTH_CONFIG.SESSION_DAYS),
}, JWT_SECRET);

/* Checks the signature and expiry, and throws if either is invalid */
export const verifyToken = (token: string) => verify(token, JWT_SECRET, "HS256");

/* Returns the token payload for a valid refresh token, otherwise null */
export const verifyRefreshToken = async (token: string) => {
  try {
    const payload = await verifyToken(token);
    return payload.typ === TOKEN_TYPE.REFRESH ? payload : null;
  } catch {
    return null;
  }
};
