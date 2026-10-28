/* Library imports */
import type { Context, Env } from "hono";

/* Backend module imports */
import type { AuthContext } from "@backend/types/auth";

/* One failed field in a rejected request body */
export interface PayloadValidationError {
  path: string;    /* Dotted field path, for example "email" */
  message: string; /* User-facing validation message */
}

/* Standard body returned by every endpoint */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  error?: string;
  validation_errors?: PayloadValidationError[];
  timestamp: string;
}

/* Hono context after jsonValidator has accepted the body, which types c.req.valid("json") */
export type ValidatedJsonContext<T> = Context<Env, string, { out: { json: T } }>;

/* Hono environment for routes behind the authenticate middleware */
export interface AuthEnv extends Env {
  Variables: {
    auth: AuthContext;
  };
}
