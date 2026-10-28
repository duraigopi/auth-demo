/* Backend module imports */
import type { UserRole } from "@backend/types/auth";

export const AUTH_CONFIG = {
  MAX_FAILED_ATTEMPTS: 5,     /* Failed sign-ins allowed before the account is locked */
  LOCKOUT_MINUTES: 15,
  SESSION_DAYS: 7,
  ACCESS_TOKEN_MINUTES: 15,   /* Short on purpose, since a stolen access token cannot be revoked before it expires */
  SALT_ROUNDS: 12,            /* bcrypt cost, higher is slower to brute-force but also slower to sign in */
  LOGIN_ATTEMPT_TTL_DAYS: 1,  /* How long a LoginAttempts row lives after the last failure, so old counters clean themselves up */
} as const;

/* Kept in the token's typ claim, so a refresh token can never be used as an access token or the other way round */
export const TOKEN_TYPE = {
  ACCESS: "access",
  REFRESH: "refresh",
} as const;

/* Physical DynamoDB table names, keyed by canonical entity name */
export const TABLES = {
  USERS: "Users",
  SESSIONS: "Sessions",                      /* one row per login, keyed by session_id; rows expire through the ttl attribute */
  LOGIN_ATTEMPTS: "LoginAttempts",           /* failed sign-in counter per email; rows expire through ttl */
} as const;

/* GSI names, which must match the table definition */
export const TABLE_INDEXES = {
  USERS_BY_EMAIL: "email-index",
  SESSIONS_BY_USER: "user_id-index",
} as const;

export const USER_ROLE = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export const USER_ROLE_VALUES: UserRole[] = Object.values(USER_ROLE);

export const CORS_ALLOWED_HEADERS = ["Content-Type", "Authorization"];

/* Request ceilings; every body here is small JSON, so the limit is low */
export const REQUEST_LIMITS = {
  MAX_BODY_SIZE_KB: 100,
} as const;

/* Requests one caller may make per window; the store is per Lambda container, so this curbs one caller's loop rather than a distributed flood */
export const RATE_LIMIT = {
  WINDOW_MS: 60 * 1000,
  MAX_REQUESTS: 120,
} as const;
