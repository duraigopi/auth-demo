/* Backend module imports */
import type { UserRole } from "@backend/types/auth";

export const AUTH_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,
  LOCKOUT_MINUTES: 15,
  SESSION_DAYS: 7,
  ACCESS_TOKEN_MINUTES: 15,
  SALT_ROUNDS: 12,
  LOGIN_ATTEMPT_TTL_DAYS: 1,
} as const;

/* Stored in the token's typ claim so the two token types can't be swapped */
export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

export const USER_ROLE = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export const USER_ROLE_VALUES: UserRole[] = Object.values(USER_ROLE);

export const CORS_ALLOWED_HEADERS = ["Content-Type", "Authorization"];

export const REQUEST_LIMITS = {
  MAX_BODY_SIZE_KB: 100,
} as const;

/* Requests allowed from one source IP in each window */
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_REQUESTS: 120,
} as const;
