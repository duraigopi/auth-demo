/* Library imports */
import { sign, verify } from "hono/jwt";

/* Backend module imports */
import { JWT_SECRET } from "@backend/config/env";
import { AUTH_CONFIG, TOKEN_TYPE } from "@backend/constants/auth";
import { addDaysToUnixTimestamp, addMinutesToUnixTimestamp, getUnixTimestamp } from "@backend/utils/time-calculations";
import type { UserRole } from "@backend/types/user";

/* Signed access token (HS256); sid ties it to the session row that can be revoked */
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

/* Signed refresh token; sub lets the user be read at the same time as the session, and jti must match the id stored on the session, so each refresh replaces the previous token */
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

/* Throws when the signature is wrong or the token has expired */
export const verifyToken = (token: string) => verify(token, JWT_SECRET, "HS256");

/* Payload of a valid, unexpired refresh token, or null for anything else, including an access token */
export const verifyRefreshToken = async (token: string) => {
  try {
    const payload = await verifyToken(token);
    return payload.typ === TOKEN_TYPE.REFRESH ? payload : null;
  } catch {
    return null;
  }
};
