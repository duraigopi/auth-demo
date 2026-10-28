/* Library imports */
import { z } from "zod/v4";

/* Backend module imports */
import { nameField, passwordField } from "@backend/schemas/auth";

/* The user can change only their name; email, role and active status are not theirs to edit */
export const updateProfileSchema = z.object({
  name: nameField,
});

/* The current password is checked first, so a stolen access token alone cannot set a new one */
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
