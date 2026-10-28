/* Library imports */
import type { EntityItem } from "electrodb";
import type { z } from "zod/v4";

/* Backend module imports */
import type { USER_ROLE } from "@backend/constants/auth";
import type { UserEntity } from "@backend/entities/user";
import type { loginSchema, refreshSchema, signupSchema } from "@backend/schemas/auth";
import type { listQuerySchema } from "@backend/schemas/query";
import type { createUserSchema, updateUserSchema, userIdParamSchema, userListQuerySchema } from "@backend/schemas/user";

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

/* Admin create-user request body, derived from the create-user schema */
export type CreateUserFormData = z.infer<typeof createUserSchema>;

/* Admin edit-user request body, derived from the update-user schema */
export type UpdateUserFormData = z.infer<typeof updateUserSchema>;

/* Path parameters of the user routes, derived from the user-id schema */
export type UserIdParam = z.infer<typeof userIdParamSchema>;

/* Pagination and search params shared by every list endpoint */
export type ListQueryParams = z.infer<typeof listQuerySchema>;

/* Query params accepted by GET /users */
export type UserListQueryParams = z.infer<typeof userListQuerySchema>;
