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

/* All user routes are admin-only */
usersRoutes.use("*", authMiddleware, adminMiddleware);

/* GET /: list users with search, filters and pagination */
usersRoutes.get("/", zValidatorWrapper("query", userListQuerySchema), list);

/* GET /:userId: get one user */
usersRoutes.get("/:userId", zValidatorWrapper("param", userIdParamSchema), get);

/* POST /: create a user with a role and an initial password */
usersRoutes.post("/", zValidatorWrapper("json", createUserSchema), create);

/* PUT /:userId: edit a user's name or role */
usersRoutes.put("/:userId", zValidatorWrapper("param", userIdParamSchema), zValidatorWrapper("json", updateUserSchema), update);

/* POST /:userId/enable: re-enable a disabled user */
usersRoutes.post("/:userId/enable", zValidatorWrapper("param", userIdParamSchema), enable);

/* POST /:userId/disable: block login but keep the record */
usersRoutes.post("/:userId/disable", zValidatorWrapper("param", userIdParamSchema), disable);

/* DELETE /:userId: permanently delete a user */
usersRoutes.delete("/:userId", zValidatorWrapper("param", userIdParamSchema), remove);
