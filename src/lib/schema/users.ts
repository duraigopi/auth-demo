/* Library imports */
import { z } from "zod/v4";

/* Lib module imports */
import { USER_ROLES } from "@lib/constants/auth";
import { emailField, passwordField } from "@lib/schema/auth";

export const editUserSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter the full name")
    .max(100, "Please enter a name less than 100 characters"),
  role: z.enum(USER_ROLES, { error: "Please select the role" }),
});

export const createUserSchema = z.object({
  name: z
    .string()
    .min(1, "Please enter the full name")
    .max(100, "Please enter a name less than 100 characters"),
  email: emailField,
  password: passwordField,
  role: z.enum(USER_ROLES, { error: "Please select the role" }),
});
