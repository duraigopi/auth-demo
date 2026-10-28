/* Library imports */
import type { z } from "zod/v4";

/* Backend module imports */
import type { UserRole } from "@backend/types/user";
import type { loginSchema, refreshSchema, signupSchema } from "@backend/schemas/auth";

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
