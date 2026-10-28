/* Library imports */
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export const env = createEnv({
  clientPrefix: "",
  client: {},
  server: {
    JWT_SECRET: z.string({ error: "is required" }).min(32, "must be at least 32 characters"),
    CORS_ALLOWED_ORIGINS: z.string().default("http://localhost:3000"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});

export const JWT_SECRET = env.JWT_SECRET;

export const CORS_ALLOWED_ORIGINS = env.CORS_ALLOWED_ORIGINS.split(",").map((origin) => origin.trim());
