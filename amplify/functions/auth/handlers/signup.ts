/* Library imports */
import { nanoid } from "nanoid";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { USER_ROLE } from "@backend/constants/auth";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { hashPassword } from "@backend/utils/password";
import { toPublicUser } from "@backend/utils/user";
import type { ValidatedJsonContext } from "@backend/types/api";
import type { SignupFormData } from "@backend/types/auth";

export const signup = async (c: ValidatedJsonContext<SignupFormData>) => {
  const { name, email, password } = c.req.valid("json");

  try {
    /* Reject an email that already has an account (not atomic: concurrent signups could both pass) */
    const { data: existing } = await UserEntity
      .query.byEmail({ email })
      .go({
        attributes: ["user_id"],
      });
    if (existing.length > 0) {
      const response = formatErrorResponse({
        message: "An account with this email already exists. Please log in instead.",
        error: ERROR_CODES.EMAIL_EXISTS,
      });
      return c.json(response, 409);
    }

    /* Only the bcrypt hash is stored */
    const passwordHash = await hashPassword(password);

    /* Signups are always CLIENT, the role is never taken from the request */
    const { data: created } = await UserEntity.create({
      user_id: nanoid(),
      email,
      name,
      password_hash: passwordHash,
      role: USER_ROLE.CLIENT,
    }).go();

    const response = formatSuccessResponse({
      message: "Account created successfully.",
      data: toPublicUser(created),
    });
    return c.json(response, 201);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to create account";
    logError({
      title: "[AUTH-SIGNUP] 500: Failed to create account",
      data: { error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to create your account. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
