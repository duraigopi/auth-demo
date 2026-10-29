/* Library imports */
import { z } from "zod/v4";

/* Lib module imports */
import { USER_ROLES } from "@lib/constants/auth";
import { emailField, nameField, passwordField } from "@lib/schema/auth";

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: z.enum(USER_ROLES, { error: "Please select the role" }),
});

/* Only the name and role can be edited */
export const editUserSchema = createUserSchema.pick({
  name: true,
  role: true,
});
