/* Library imports */
import { z } from "zod/v4";

export const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter your full name")
    .max(100, "Please enter a name less than 100 characters"),
});

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Please enter your current password")
      .max(128, "Please enter a password less than 128 characters"),
    new_password: z
      .string()
      .min(8, "Please enter a password with at least 8 characters")
      .max(128, "Please enter a password less than 128 characters")
      .regex(/[A-Z]/, "Please include at least one uppercase letter in your password")
      .regex(/[a-z]/, "Please include at least one lowercase letter in your password")
      .regex(/[0-9]/, "Please include at least one number in your password")
      .regex(/[^A-Za-z0-9]/, "Please include at least one special character in your password"),
    confirm_password: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  })
  .refine((data) => data.new_password !== data.current_password, {
    message: "Please choose a password different from your current one",
    path: ["new_password"],
  });
