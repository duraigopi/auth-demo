/* Library imports */
import type { z } from "zod/v4";

/* Lib module imports */
import type { loginSchema, signupSchema } from "@lib/schema/auth";

/* Shared module imports */
import type { AuthTokens } from "@shared/types/api";

/* Login form values, derived from the login schema */
export type LoginFormData = z.infer<typeof loginSchema>;

/* Signup form values, derived from the signup schema */
export type SignupFormData = z.infer<typeof signupSchema>;

/* A user as the API returns it, without the password hash */
export interface PublicUser {
  user_id: string;
  email: string;
  name: string;
  role: "ADMIN" | "CLIENT";
  is_active: boolean;
}

/* What login returns: both tokens and the signed-in user */
export interface LoginResponseData extends AuthTokens {
  user: PublicUser;
}

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
}
