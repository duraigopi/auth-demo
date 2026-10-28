/* Auth route definitions */

/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { authMiddleware } from "@backend/middleware/auth";
import { loginSchema, refreshSchema, signupSchema } from "@backend/schemas/auth";
import { zValidatorWrapper } from "@backend/utils/schema-validator";

/* Auth module imports */
import { login } from "@backend/handlers/login";
import { logout } from "@backend/handlers/logout";
import { refresh } from "@backend/handlers/refresh";
import { signup } from "@backend/handlers/signup";

export const authRoutes = new Hono();

/* POST /signup — Create a client account; unauthenticated, since the caller has no token yet */
authRoutes.post("/signup", zValidatorWrapper("json", signupSchema), signup);

/* POST /login — Check credentials and open a session; unauthenticated for the same reason */
authRoutes.post("/login", zValidatorWrapper("json", loginSchema), login);

/* POST /refresh — Swap a valid refresh token for a new access token and a new refresh token; unauthenticated, since the access token has usually expired */
authRoutes.post("/refresh", zValidatorWrapper("json", refreshSchema), refresh);

/* POST /logout — Revoke the caller's session; needs a valid access token */
authRoutes.post("/logout", authMiddleware, logout);
