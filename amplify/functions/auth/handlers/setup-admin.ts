/* Library imports */
import { nanoid } from "nanoid";

/* Backend module imports */
import { USER_ROLE } from "@backend/constants/auth";
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { hashPassword } from "@backend/utils/password";
import type { ValidatedJsonContext } from "@backend/types/api";
import type { SignupFormData } from "@backend/types/auth";

export const setupAdmin = async (c: ValidatedJsonContext<SignupFormData>) => {
  const { name, email, password } = c.req.valid("json");

  try {
    /* Only works until the first admin exists, after that admins are created by admins */
    const { data: users } = await UserEntity
      .scan
      .go({
        pages: "all",
        attributes: ["role"],
      });
    if (users.some((user) => user.role === USER_ROLE.ADMIN)) {
      const response = formatErrorResponse({
        message: "Setup is already done. Ask an admin to create your account.",
        error: ERROR_CODES.FORBIDDEN,
      });
      return c.json(response, 403);
    }

    const { data: existing } = await UserEntity
      .query.byEmail({ email })
      .go({
        attributes: ["user_id"],
      });
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
      role: USER_ROLE.ADMIN,
    }).go();

    const response = formatSuccessResponse({ message: "Admin account created successfully." });
    return c.json(response, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create admin account";
    logError({
      title: "[AUTH-SETUP-ADMIN] 500: Failed to create admin account",
      data: { error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to create the admin account. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
