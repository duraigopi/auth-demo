/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { authMiddleware } from "@backend/middleware/auth";
import { changePasswordSchema, updateProfileSchema } from "@backend/schemas/auth";
import { zValidatorWrapper } from "@backend/utils/schema-validator";
import type { AuthEnv } from "@backend/types/api";

/* Handler imports */
import { changePassword } from "@backend/handlers/me/change-password";
import { get } from "@backend/handlers/me/get";
import { update } from "@backend/handlers/me/update";

export const meRoutes = new Hono<AuthEnv>();

/* Any signed-in user can use these, for their own account only */
meRoutes.use("*", authMiddleware);

/* GET /: get the current user */
meRoutes.get("/", get);

/* PUT /: update your own name */
meRoutes.put("/", zValidatorWrapper("json", updateProfileSchema), update);

/* PUT /password: change password and sign out other sessions */
meRoutes.put("/password", zValidatorWrapper("json", changePasswordSchema), changePassword);
