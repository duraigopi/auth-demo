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

/* Auth module imports */
import { authRoutes } from "@backend/routes/auth";
import { meRoutes } from "@backend/routes/me";
import { usersRoutes } from "@backend/routes/users";

/* Exported so an OpenAPI generator can read the mounted routes later */
export const app = new Hono();
const v1 = app.basePath("/api/v1");

/* Request pipeline, each layer is placed so it sees what the one before it has already settled */

/* 1. Request tracing, first so every log line is correlatable to one invocation */
app.use("*", requestId());

/* 2. Request logging, ahead of the guards, since rejected traffic is the traffic worth seeing */
app.use("*", logger((line) => logInfo({ title: "[REQUEST]: Handled", data: { line } })));

/* 3. CORS, ahead of every guard below so their 4xx bodies carry the headers, or the browser reports a network failure instead of the real reason */
app.use("*", cors({
  origin: CORS_ALLOWED_ORIGINS,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: CORS_ALLOWED_HEADERS,
}));

/* 4. Security headers, outside the body ceiling, so an oversized-payload rejection is hardened too. Tuned for a JSON API that never renders anything, so the strictest policy is also the correct one. */
app.use("*", secureHeaders({
  contentSecurityPolicy: {
    defaultSrc: ["'none'"],
    frameAncestors: ["'none'"],
  },
  /* A year, without preload, since preloading is a hard-to-reverse commitment covering the whole domain */
  strictTransportSecurity: "max-age=31536000; includeSubDomains",
  xContentTypeOptions: "nosniff",
  xFrameOptions: "DENY",
  /* Off, since the legacy auditor is deprecated and its filtering has introduced vulnerabilities of its own */
  xXssProtection: "0",
  referrerPolicy: "no-referrer",
  /* Blocks another site from pulling a response in as a no-cors subresource */
  crossOriginResourcePolicy: "same-origin",
}));

/* 5. Body ceiling, rejects an oversized payload before anything downstream parses it */
app.use("*", bodyLimit({
  maxSize: REQUEST_LIMITS.MAX_BODY_SIZE_KB * 1024,
  /* Replaces the package's bare text body so a 413 carries the same envelope as every other error */
  onError: (c) => {
    const response = formatErrorResponse({
      message: `Request body is too large. The maximum size is ${REQUEST_LIMITS.MAX_BODY_SIZE_KB}KB.`,
      error: ERROR_CODES.PAYLOAD_TOO_LARGE,
    });
    return c.json(response, 413);
  },
}));

/* 6. Rate cap per caller. Keyed on the source IP from the Lambda event rather than a header, because x-forwarded-for is caller-supplied and a forged value would mint a fresh bucket per request. An unresolvable caller shares one bucket instead of escaping the cap. */
app.use("*", rateLimiter({
  windowMs: RATE_LIMIT.WINDOW_MS,
  limit: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: "draft-7",
  keyGenerator: (c) => (c.env as { event?: APIGatewayProxyEventV2 }).event?.requestContext.http.sourceIp ?? "unknown",
  /* Replaces the package's plain-string body so a 429 carries the same envelope as every other error */
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

v1.route("/auth", authRoutes);
v1.route("/me", meRoutes);
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
