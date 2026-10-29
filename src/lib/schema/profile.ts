/* Library imports */
import { z } from "zod/v4";

/* Lib module imports */
import { nameField, passwordField } from "@lib/schema/auth";

export const profileSchema = z.object({
  name: nameField,
});

export const changePasswordSchema = z
  .object({
    current_password: z
      .string()
      .min(1, "Please enter your current password")
      .max(128, "Please enter a password less than 128 characters"),
    new_password: passwordField,
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
