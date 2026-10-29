/* Library imports */
import { compareDesc } from "date-fns";

/* Backend module imports */
import { ERROR_CODES } from "@backend/constants/error-messages";
import { UserEntity } from "@backend/entities/user";
import { formatErrorResponse, formatSuccessResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";
import { isInDayRange } from "@backend/utils/time-calculations";
import { toPublicUser } from "@backend/utils/user";
import type { AuthValidatedContext } from "@backend/types/api";
import type { UserListQueryParams } from "@backend/types/auth";

export const list = async (c: AuthValidatedContext<{ query: UserListQueryParams }>) => {
  const { page, limit, search, role, is_active, from, to } = c.req.valid("query");

  try {
    /* Scan the whole table and filter in memory, fine for a small list */
    const { data: users } = await UserEntity
      .scan
      .go({
        pages: "all",
        attributes: ["user_id", "email", "name", "role", "is_active", "created_at"],
      });

    /* Search by name or email, emails are stored lowercase */
    const searchTerm = search?.toLowerCase();
    const filteredUsers = users.filter((user) => {
      if (role && user.role !== role) return false;
      if (is_active !== undefined && user.is_active !== is_active) return false;
      if (!isInDayRange(user.created_at, from, to)) return false;
      if (searchTerm && !user.name.toLowerCase().includes(searchTerm) && !user.email.includes(searchTerm)) return false;
      return true;
    });

    filteredUsers.sort((a, b) => compareDesc(a.created_at, b.created_at) || a.user_id.localeCompare(b.user_id));

    /* Take the requested page */
    const offset = (page - 1) * limit;
    const total = filteredUsers.length;
    const pageRows = filteredUsers.slice(offset, offset + limit);

    const response = formatSuccessResponse({
      message: "Users fetched successfully.",
      data: pageRows.map(toPublicUser),
      count: pageRows.length,
      pagination: {
        page,
        limit,
        total,
        total_pages: Math.max(1, Math.ceil(total / limit)),
      },
    });
    return c.json(response, 200);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch users";
    logError({
      title: "[USERS-LIST] 500: Failed to fetch users",
      data: { userId: c.var.auth.userId, error: errorMessage },
    });
    const response = formatErrorResponse({
      message: "Failed to retrieve users. Please try again.",
      error: ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, 500);
  }
};
