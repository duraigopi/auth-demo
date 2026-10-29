/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { authMiddleware } from "@backend/middleware/auth";
import { loginSchema, signupSchema } from "@backend/schemas/auth";
import { zValidatorWrapper } from "@backend/utils/schema-validator";

/* Handler imports */
import { login } from "@backend/handlers/login";
import { logout } from "@backend/handlers/logout";
import { refresh } from "@backend/handlers/refresh";
import { setupAdmin } from "@backend/handlers/setup-admin";
import { signup } from "@backend/handlers/signup";

export const authRoutes = new Hono();

/* POST /setup-admin: create an admin account (open, no authentication) */
authRoutes.post("/setup-admin", zValidatorWrapper("json", signupSchema), setupAdmin);

/* POST /signup: create a client account (public) */
authRoutes.post("/signup", zValidatorWrapper("json", signupSchema), signup);

/* POST /login: check credentials and start a session (public) */
authRoutes.post("/login", zValidatorWrapper("json", loginSchema), login);

/* POST /refresh: get new tokens from the refresh token (public, the access token has expired) */
authRoutes.post("/refresh", refresh);

/* POST /logout: revoke the current session */
authRoutes.post("/logout", authMiddleware, logout);
