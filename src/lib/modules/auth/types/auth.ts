/* Library imports */
import type { z } from "zod/v4";

/* Lib module imports */
import type { loginSchema, signupSchema } from "@auth/schema/auth";

/* Login form values, derived from the login schema */
export type LoginFormData = z.infer<typeof loginSchema>;

/* Signup form values, derived from the signup schema */
export type SignupFormData = z.infer<typeof signupSchema>;
