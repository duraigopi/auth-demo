/* Library imports */
import { z } from "zod/v4";

/* Backend module imports */
import { USER_ROLE_VALUES } from "@backend/constants/auth";
import { emailField, nameField, passwordField } from "@backend/schemas/auth";
import { listQuerySchema } from "@backend/schemas/query";

const roleField = z.enum(USER_ROLE_VALUES, { error: "Please select a valid role" });

export const userIdParamSchema = z.object({
  userId: z
    .string()
    .min(1, "Please provide the user id")
    .max(50, "Please provide a valid user id"),
});

export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: roleField,
});

/* Email, password and active status can't be edited here */
export const updateUserSchema = createUserSchema
  .pick({ name: true, role: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
    path: ["name"],
  });

export const userListQuerySchema = listQuerySchema.extend({
  role: roleField.optional(),
  is_active: z.enum(["true", "false"], { error: "Please provide true or false" }).transform((value) => value === "true").optional(),
});
