/* Library imports */
import { Hono } from "hono";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { handle } from "@hono/aws-lambda";
import { bodyLimit } from "hono/body-limit";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { logger } from "hono/logger";
import { requestId } from "hono/request-id";
import { secureHeaders } from "hono/secure-headers";
import { rateLimiter } from "hono-rate-limiter";

/* Backend module imports */
import { CORS_ALLOWED_ORIGINS } from "@backend/config/env";
import { CORS_ALLOWED_HEADERS, RATE_LIMIT, REQUEST_LIMITS } from "@backend/constants/auth";
import { ERROR_CODES, ERROR_MESSAGES } from "@backend/constants/error-messages";
import { formatErrorResponse } from "@backend/utils/api-response";
import { logError, logInfo } from "@backend/utils/logger";

/* Route imports */
import { authRoutes } from "@backend/routes/auth";
import { meRoutes } from "@backend/routes/me";
import { usersRoutes } from "@backend/routes/users";

const app = new Hono();
const v1 = app.basePath("/api/v1");

/* Middleware order matters: each layer runs before the ones below it */

/* Adds a request id to every request, so log lines can be tied together */
app.use("*", requestId());

/* Logs the method, path and status of every request, including rejected ones */
app.use("*", logger((line) => logInfo({ title: "[REQUEST]: Handled", data: { line } })));

/* CORS comes before the guards so their error responses also get the CORS headers */
app.use("*", cors({
  origin: CORS_ALLOWED_ORIGINS,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: CORS_ALLOWED_HEADERS,
}));

/* Security headers. This API only returns JSON, so the CSP can deny everything */
app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  xXssProtection: "0",
  referrerPolicy: "no-referrer",
  crossOriginResourcePolicy: "same-origin",
}));

/* Rejects request bodies above the size limit before anything parses them */
app.use("*", bodyLimit({
  maxSize: REQUEST_LIMITS.MAX_BODY_SIZE_KB * 1024,
  onError: (c) => {
    const response = formatErrorResponse({
      message: `Request body is too large. The maximum size is ${REQUEST_LIMITS.MAX_BODY_SIZE_KB}KB.`,
      error: ERROR_CODES.PAYLOAD_TOO_LARGE,
    });
    return c.json(response, 413);
  },
}));

/* Rate limit per caller, keyed on the source IP from the Lambda event. x-forwarded-for isn't used because the caller controls it */
app.use("*", rateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: "draft-7",
  keyGenerator: (c) => (c.env as { event?: APIGatewayProxyEventV2 }).event?.requestContext.http.sourceIp ?? "unknown",
  handler: (c) => {
    logError({
      title: "[RATE-LIMIT] 429: Caller exceeded the request cap",
      data: { limit: RATE_LIMIT.MAX_REQUESTS },
    });
    const response = formatErrorResponse({
      message: "Too many requests. Please wait a moment and try again.",
      error: ERROR_CODES.RATE_LIMIT_EXCEEDED,
    });
    return c.json(response, 429);
  },
}));

/* Route groups */
v1.route("/auth", authRoutes);
v1.route("/me", meRoutes);
v1.route("/users", usersRoutes);

/* Reply for unknown routes */
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

/* Last-resort handler: any error that wasn't handled in a route ends up here */
app.onError((err, c) => {
  /* HTTPException (for example a malformed JSON body) keeps its status but uses the standard body */
  if (err instanceof HTTPException) {
    const response = formatErrorResponse({
      message: err.message,
      error: err.status < 500 ? ERROR_CODES.BAD_REQUEST : ERROR_CODES.INTERNAL_SERVER_ERROR,
    });
    return c.json(response, err.status);
  }

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
