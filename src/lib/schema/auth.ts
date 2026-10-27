/* Library imports */
import { z } from "zod/v4";

const emailField = z
  .string()
  .min(1, "Please enter your email address")
  .max(254, "Please enter an email address less than 254 characters")
  .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email address");

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Please enter your password")
    .max(128, "Please enter a password less than 128 characters"),
});

export const signupSchema = z
  .object({
    name: z
      .string()
      .min(1, "Please enter your full name")
      .max(100, "Please enter a name less than 100 characters"),
    email: emailField,
    password: z
      .string()
      .min(8, "Please enter a password with at least 8 characters")
      .max(128, "Please enter a password less than 128 characters")
      .regex(/[A-Z]/, "Please include at least one uppercase letter in your password")
      .regex(/[a-z]/, "Please include at least one lowercase letter in your password")
      .regex(/[0-9]/, "Please include at least one number in your password")
      .regex(/[^A-Za-z0-9]/, "Please include at least one special character in your password"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
