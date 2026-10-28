/* Library imports */
import type { EntityItem } from "electrodb";
import type { z } from "zod/v4";

/* Backend module imports */
import type { USER_ROLE } from "@backend/constants/auth";
import type { UserEntity } from "@backend/entities/user";
import type { loginSchema, refreshSchema, signupSchema } from "@backend/schemas/auth";

/* Role values a user can have */
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/* User fields that are safe to send to the browser, which leaves out the password hash */
export type PublicUser = Pick<EntityItem<typeof UserEntity>, "user_id" | "email" | "name" | "role" | "is_active">;

/* Login request body, derived from the login schema */
export type LoginFormData = z.infer<typeof loginSchema>;

/* Signup request body, derived from the signup schema */
export type SignupFormData = z.infer<typeof signupSchema>;

/* Refresh request body, derived from the refresh schema */
export type RefreshFormData = z.infer<typeof refreshSchema>;

/* Who is calling, read from a verified access token */
export interface AuthContext {
  userId: string;
  role: UserRole;
  sessionId: string;
}
