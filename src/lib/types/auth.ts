/* Library imports */
import type { z } from "zod/v4";

/* Lib module imports */
import type { USER_ROLES } from "@lib/constants/auth";
import type { loginSchema, signupSchema } from "@lib/schema/auth";
import type { changePasswordSchema, profileSchema } from "@lib/schema/profile";
import type { editUserSchema } from "@lib/schema/users";

/* Shared module imports */
import type { AuthTokens } from "@shared/types/api";

/* An account role, one of the values in USER_ROLES */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/* Login form values, derived from the login schema */
export type LoginFormData = z.infer<typeof loginSchema>;

/* Signup form values, derived from the signup schema */
export type SignupFormData = z.infer<typeof signupSchema>;

/* Edit-user form values, derived from the edit schema */
export type EditUserFormData = z.infer<typeof editUserSchema>;

/* Profile form values, derived from the profile schema */
export type ProfileFormData = z.infer<typeof profileSchema>;

/* Change-password form values, including the confirm field the API does not receive */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/* A user as the API returns it, without the password hash */
export interface PublicUser {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

/* What login returns: both tokens and the signed-in user */
export interface LoginResponse extends AuthTokens {
  user: PublicUser;
}

/* What signup, GET /me and GET /users/{userId} return */
export type UserResponse = PublicUser;

/* What GET /users returns */
export type UserListResponse = PublicUser[];

/* Body of POST /auth/signup, the form without its confirm-password field */
export type SignupRequestBody = Pick<SignupFormData, "name" | "email" | "password">;

/* Body of PUT /me, used by the profile page */
export interface UpdateProfileBody {
  name: string;
}

/* Body of PUT /me/password, used by the change-password form */
export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
}

/* Body of POST /users, an admin creating an account */
export interface CreateUserBody extends SignupRequestBody {
  role: PublicUser["role"];
}

/* Body of PUT /users/{userId}, any of the editable fields */
export type UpdateUserBody = Partial<Pick<CreateUserBody, "name" | "role">>;

/* Query params of GET /users that the dashboard uses */
export interface UserListParams {
  page: number;
  limit: number;
  search?: string;
  /* Created-at range, both ends included, as YYYY-MM-DD */
  from?: string;
  to?: string;
}
