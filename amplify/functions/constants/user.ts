/* Backend module imports */
import type { UserRole } from "@backend/types/user";

export const USER_ROLE = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export const USER_ROLE_VALUES: UserRole[] = Object.values(USER_ROLE);
