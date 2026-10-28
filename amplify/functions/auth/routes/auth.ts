/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { authMiddleware } from "@backend/middleware/auth";
import { loginSchema, refreshSchema, signupSchema } from "@backend/schemas/auth";
import { zValidatorWrapper } from "@backend/utils/schema-validator";

/* Handler imports */
import { login } from "@backend/handlers/login";
import { logout } from "@backend/handlers/logout";
import { refresh } from "@backend/handlers/refresh";
import { signup } from "@backend/handlers/signup";

export const authRoutes = new Hono();

/* POST /signup: create a client account (public) */
authRoutes.post("/signup", zValidatorWrapper("json", signupSchema), signup);

/* POST /login: check credentials and start a session (public) */
authRoutes.post("/login", zValidatorWrapper("json", loginSchema), login);

/* POST /refresh: exchange a refresh token for new tokens (public, the access token has usually expired) */
authRoutes.post("/refresh", zValidatorWrapper("json", refreshSchema), refresh);

/* POST /logout: revoke the current session */
authRoutes.post("/logout", authMiddleware, logout);
