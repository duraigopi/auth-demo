/* Lambda environment variables, validated once at cold start */

/* Library imports */
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  /* No browser bundle here, so every variable is server-side and the prefix stays empty */
  clientPrefix: "",
  client: {},
  server: {
    /* 32 characters is the minimum for a safe HS256 signing key */
    JWT_SECRET: z.string({ error: "is required" }).min(32, "must be at least 32 characters"),
    /* Comma-separated frontend origins the browser may call this API from */
    CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  },
  runtimeEnv: process.env,
  /* A blank value counts as missing, so a required variable cannot pass by being present but empty */
  emptyStringAsUndefined: true,
});

export const JWT_SECRET = env.JWT_SECRET;

export const CORS_ALLOWED_ORIGINS = env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
