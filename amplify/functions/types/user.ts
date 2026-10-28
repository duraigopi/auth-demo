/* Library imports */
import type { EntityItem } from "electrodb";

/* Backend module imports */
import type { USER_ROLE } from "@backend/constants/user";
import type { UserEntity } from "@backend/entities/user";

/* Role values a user can have */
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/* User fields that are safe to send to the browser, which leaves out the password hash */
export type PublicUser = Pick<EntityItem<typeof UserEntity>, "user_id" | "email" | "name" | "role" | "is_active">;
