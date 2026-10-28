/* Backend module imports */
import type { USER_ROLE } from "@backend/constants/user";

/* Role values a user can have */
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];
