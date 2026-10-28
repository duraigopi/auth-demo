/* Own-account route definitions */

/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { authMiddleware } from "@backend/middleware/auth";
import { changePasswordSchema, updateProfileSchema } from "@backend/schemas/me";
import { zValidatorWrapper } from "@backend/utils/schema-validator";
import type { AuthEnv } from "@backend/types/api";

/* Handler imports */
import { changePassword } from "@backend/handlers/me/change-password";
import { get } from "@backend/handlers/me/get";
import { update } from "@backend/handlers/me/update";

export const meRoutes = new Hono<AuthEnv>();

/* Any signed-in user, whatever the role, but only for their own account */
meRoutes.use("*", authMiddleware);

/* GET / — Fetch the signed-in user */
meRoutes.get("/", get);

/* PUT / — Edit the signed-in user's name */
meRoutes.put("/", zValidatorWrapper("json", updateProfileSchema), update);

/* PUT /password — Change the signed-in user's password and end their other sessions */
meRoutes.put("/password", zValidatorWrapper("json", changePasswordSchema), changePassword);
