/* Library imports */
import type { EntityItem } from "electrodb";
import type { z } from "zod/v4";

/* Backend module imports */
import type { USER_ROLE } from "@backend/constants/auth";
import type { UserEntity } from "@backend/entities/user";
import type { changePasswordSchema, loginSchema, signupSchema, updateProfileSchema } from "@backend/schemas/auth";
import type { createUserSchema, updateUserSchema, userIdParamSchema, userListQuerySchema } from "@backend/schemas/user";

/* Role a user can have (ADMIN or CLIENT), stored on the user and in the access token */
export type UserRole = (typeof USER_ROLE)[keyof typeof USER_ROLE];

/* User fields that are safe to return to the client (no password hash), built by toPublicUser */
export type PublicUser = Pick<EntityItem<typeof UserEntity>, "user_id" | "email" | "name" | "role" | "is_active">;

/* Body of POST /auth/login */
export type LoginFormData = z.infer<typeof loginSchema>;

/* Body of POST /auth/signup */
export type SignupFormData = z.infer<typeof signupSchema>;

/* Caller details taken from the access token, available as c.var.auth */
export interface AuthContext {
  userId: string;
  role: UserRole;
  sessionId: string;
}

/* Body of POST /users, where an admin creates a user */
export type CreateUserFormData = z.infer<typeof createUserSchema>;

/* Body of PUT /users/:userId, where an admin edits a name or role */
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

/* The :userId path param on the user routes */
export type UserIdParam = z.infer<typeof userIdParamSchema>;

/* Query params of GET /users */
export type UserListQueryParams = z.infer<typeof userListQuerySchema>;

/* Body of PUT /me, where a user updates their own name */
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;

/* Body of PUT /me/password */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
