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

/* The admin chooses the role and the first password, which the user can change later */
export const createUserSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
  role: roleField,
});

/* Email and password are left out on purpose, so an edit cannot change how a user signs in; enabling and disabling have their own routes */
export const updateUserSchema = createUserSchema
  .pick({ name: true, role: true })
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Please provide at least one field to update",
    path: ["name"],
  });

/* GET /users, the shared pagination and search fields plus the role and active filters */
export const userListQuerySchema = listQuerySchema.extend({
  role: roleField.optional(),
  is_active: z.enum(["true", "false"], { error: "Please provide true or false" }).transform((value) => value === "true").optional(),
});
