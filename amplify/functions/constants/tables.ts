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
