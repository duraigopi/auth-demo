/* Users route definitions */

/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { adminMiddleware } from "@backend/middleware/admin";
import { authMiddleware } from "@backend/middleware/auth";
import { createUserSchema, userListQuerySchema, updateUserSchema, userIdParamSchema } from "@backend/schemas/user";
import { zValidatorWrapper } from "@backend/utils/schema-validator";
import type { AuthEnv } from "@backend/types/api";

/* Handler imports */
import { create } from "@backend/handlers/users/create";
import { remove } from "@backend/handlers/users/delete";
import { disable } from "@backend/handlers/users/disable";
import { enable } from "@backend/handlers/users/enable";
import { get } from "@backend/handlers/users/get";
import { list } from "@backend/handlers/users/list";
import { update } from "@backend/handlers/users/update";

export const usersRoutes = new Hono<AuthEnv>();

/* Every user route needs a signed-in admin */
usersRoutes.use("*", authMiddleware, adminMiddleware);

/* GET / — List users with search, role and active filters, and pagination */
usersRoutes.get("/", zValidatorWrapper("query", userListQuerySchema), list);

/* GET /:userId — Fetch one user */
usersRoutes.get("/:userId", zValidatorWrapper("param", userIdParamSchema), get);

/* POST / — Add a user with a chosen role and first password */
usersRoutes.post("/", zValidatorWrapper("json", createUserSchema), create);

/* PUT /:userId — Edit a user's name or role */
usersRoutes.put("/:userId", zValidatorWrapper("param", userIdParamSchema), zValidatorWrapper("json", updateUserSchema), update);

/* POST /:userId/enable — Let a disabled user sign in again */
usersRoutes.post("/:userId/enable", zValidatorWrapper("param", userIdParamSchema), enable);

/* POST /:userId/disable — Block a user from signing in, keeping the record */
usersRoutes.post("/:userId/disable", zValidatorWrapper("param", userIdParamSchema), disable);

/* DELETE /:userId — Permanently remove a user */
usersRoutes.delete("/:userId", zValidatorWrapper("param", userIdParamSchema), remove);
