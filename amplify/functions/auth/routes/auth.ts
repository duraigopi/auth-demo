/* Auth route definitions */

/* Library imports */
import { Hono } from "hono";

/* Backend module imports */
import { authenticate } from "@backend/middleware/auth";
import { loginSchema, refreshSchema, signupSchema } from "@backend/schemas/auth";
import { jsonValidator } from "@backend/utils/validator";

/* Auth module imports */
import { login } from "@backend/auth/handlers/login";
import { logout } from "@backend/auth/handlers/logout";
import { refresh } from "@backend/auth/handlers/refresh";
import { signup } from "@backend/auth/handlers/signup";

export const authRoutes = new Hono();

/* POST /signup â€” Create a client account; unauthenticated, since the caller has no token yet */
authRoutes.post("/signup", jsonValidator(signupSchema), signup);

/* POST /login â€” Check credentials and open a session; unauthenticated for the same reason */
authRoutes.post("/login", jsonValidator(loginSchema), login);

/* POST /refresh — Swap a valid refresh token for a new access token and a new refresh token; unauthenticated, since the access token has usually expired */
authRoutes.post("/refresh", jsonValidator(refreshSchema), refresh);

/* POST /logout — Revoke the caller's session; needs a valid access token */
authRoutes.post("/logout", authenticate, logout);
