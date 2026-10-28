/* Library imports */
import { nanoid } from "nanoid";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { hashPassword } from "@backend/utils/password";
import type { AuthValidatedContext } from "@backend/types/api";
import type { CreateUserFormData } from "@backend/types/auth";

export const create = async (c: AuthValidatedContext<{ json: CreateUserFormData }>) => {
  const { name, email, password, role } = c.req.valid("json");

  try {
    /* Not atomic, since an index cannot enforce uniqueness, so two simultaneous requests could both pass */
    const { data: existing } = await UserEntity.query.byEmail({ email }).go();
    if (existing.length > 0) {
      const response = formatErrorResponse({
        message: "An account with this email already exists.",
        error: ERROR_CODES.EMAIL_EXISTS,
      });
      return c.json(response, 409);
    }

    const passwordHash = await hashPassword(password);
    await UserEntity.create({
      user_id: nanoid(),
      email,
      name,
      password_hash: passwordHash,
      role,
    }).go();

    const response = formatSuccessResponse({ message: "User created successfully." });
    return c.json(response, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create user";
    logError({
      title: "[USERS-CREATE] 500: Failed to create user",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to create the user. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
