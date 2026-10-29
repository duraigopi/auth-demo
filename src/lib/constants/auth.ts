/* Lib module imports */
import type { UserRole } from "@lib/types/auth";

/* User roles, same values as the API */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export const USER_ROLE_VALUES: UserRole[] = Object.values(USER_ROLES);
