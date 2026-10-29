/* Library imports */
import { z } from "zod/v4";

/* Normalized here so handlers always get a trimmed, lowercase email */
export const emailField = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "Please enter your email address")
  .max(254, "Please enter an email address less than 254 characters")
  .pipe(z.email("Please enter a valid email address"));

export const loginSchema = z.object({
  email: emailField,
  password: z
    .string()
    .min(1, "Please enter your password")
    .max(128, "Please enter a password less than 128 characters"),
});

export const nameField = z
  .string()
  .trim()
  .min(1, "Please enter your full name")
  .max(100, "Please enter a name less than 100 characters")
  .regex(/^[^<>]*$/, "Please enter a valid full name");

export const passwordField = z
  .string()
  .min(8, "Please enter a password with at least 8 characters")
  .max(128, "Please enter a password less than 128 characters")
  .regex(/[A-Z]/, "Please include at least one uppercase letter in your password")
  .regex(/[a-z]/, "Please include at least one lowercase letter in your password")
  .regex(/[0-9]/, "Please include at least one number in your password")
  .regex(/[^A-Za-z0-9]/, "Please include at least one special character in your password");

/* Same rules as the signup form, since the frontend check can be bypassed */
export const signupSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

export const updateProfileSchema = z.object({
  name: nameField,
});

/* Requires the current password so a stolen access token isn't enough */
export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Please enter your current password")
      .max(128, "Please enter a password less than 128 characters"),
    new_password: passwordField,
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "Please choose a password different from your current one",
    path: ["new_password"],
  });
