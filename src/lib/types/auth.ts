/* Library imports */
import type { z } from "zod/v4";

/* Lib module imports */
import type { USER_ROLES } from "@lib/constants/auth";
import type { loginSchema, signupSchema } from "@lib/schema/auth";
import type { changePasswordSchema, profileSchema } from "@lib/schema/profile";
import type { createUserSchema, editUserSchema } from "@lib/schema/users";

/* Shared module imports */
import type { AuthTokens } from "@shared/types/api";

/* User role, one of USER_ROLES */
export type UserRole = (typeof USER_ROLES)[keyof typeof USER_ROLES];

/* Login form values */
export type LoginFormData = z.infer<typeof loginSchema>;

/* Signup form values */
export type SignupFormData = z.infer<typeof signupSchema>;

/* Add user form values */
export type CreateUserFormData = z.infer<typeof createUserSchema>;

/* Edit user form values */
export type EditUserFormData = z.infer<typeof editUserSchema>;

/* Profile form values */
export type ProfileFormData = z.infer<typeof profileSchema>;

/* Change password form values, the confirm field is not sent */
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

/* User returned by the API, no password hash */
export interface PublicUser {
  user_id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

/* Login response with the tokens and the user */
export interface LoginResponse extends AuthTokens {
  user: PublicUser;
}

/* Response for signup, GET /me and GET /users/{userId} */
export type UserResponse = PublicUser;

/* Response for GET /users */
export type UserListResponse = PublicUser[];

/* Request body for POST /auth/signup */
export type SignupRequestBody = Pick<SignupFormData, "name" | "email" | "password">;

/* Request body for PUT /me */
export interface UpdateProfileBody {
  name: string;
}

/* Request body for PUT /me/password */
export interface ChangePasswordBody {
  current_password: string;
  new_password: string;
}

/* Request body for POST /users */
export interface CreateUserBody extends SignupRequestBody {
  role: PublicUser["role"];
}

/* Request body for PUT /users/{userId} */
export type UpdateUserBody = Partial<Pick<CreateUserBody, "name" | "role">>;

/* Query params for GET /users */
export interface UserListParams {
  page: number;
  limit: number;
  search?: string;
  from?: string;
  to?: string;
}
