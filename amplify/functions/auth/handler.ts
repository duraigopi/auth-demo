/* Library imports */
import { Hono } from "hono";
import { handle } from "@hono/aws-lambda";
import { HTTPException } from "hono/http-exception";

/* Backend module imports */
import { ERROR_CODES, ERROR_MESSAGES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";
import { logError } from "@backend/utils/logger";

/* Auth module imports */
import { authRoutes } from "@backend/routes/auth";
import { usersRoutes } from "@backend/routes/users";

/* Exported so an OpenAPI generator can read the mounted routes later */
export const app = new Hono();
const v1 = app.basePath("/api/v1");

v1.route("/auth", authRoutes);
v1.route("/users", usersRoutes);

/* 404 fallback */
app.notFound((c) => {
  logError({
    title: "[AUTH-API]: Route not found",
    data: { method: c.req.method, path: c.req.path },
  });
  const response = formatErrorResponse({
    message: ERROR_MESSAGES.ROUTE_NOT_FOUND,
    error: ERROR_CODES.ROUTE_NOT_FOUND,
  });
  return c.json(response, 404);
});

/* Global error handler */
app.onError((err, c) => {
  /* Errors Hono raises on purpose, such as a malformed JSON body, keep their own status */
  if (err instanceof HTTPException) return err.getResponse();

  const errorMessage = err instanceof Error ? err.message : ERROR_MESSAGES.INTERNAL_SERVER_ERROR;
  logError({
    title: "[AUTH-API]: Unhandled error",
    data: { error: errorMessage },
  });
  const response = formatErrorResponse({
    message: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    error: ERROR_CODES.INTERNAL_SERVER_ERROR,
  });
  return c.json(response, 500);
});

/* Export Lambda handler */
export const handler = handle(app);
