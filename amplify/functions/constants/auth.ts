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
