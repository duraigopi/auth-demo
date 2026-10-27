/* Library imports */
import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Please enter your email address")
    .max(254, "Please enter an email address less than 254 characters")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Please enter your password")
    .max(128, "Please enter a password less than 128 characters"),
});
