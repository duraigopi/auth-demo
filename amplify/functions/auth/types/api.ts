/* Library imports */
import type { Context, Env } from "hono";

/* Backend module imports */
import type { AuthContext } from "@backend/types/auth";

/* One failed field in a rejected request body */
export interface PayloadValidationError {
  field: string;   /* Dotted field path, for example "email" */
  message: string; /* User-facing validation message */
}

/* Page position returned by list endpoints; total_pages is at least 1 so an empty list still shows one page */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/* Standard body returned by every endpoint */
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  count?: number;
  pagination?: PaginationMeta;
  error?: string;
  validation_errors?: PayloadValidationError[];
  timestamp: string;
}

/* Hono context after zValidatorWrapper has accepted the body, which types c.req.valid("json") */
export type ValidatedJsonContext<T> = Context<Env, string, { out: { json: T } }>;

/* Hono environment for routes behind the auth middleware */
export interface AuthEnv extends Env {
  Variables: {
    auth: AuthContext;
  };
}

/* Context for a handler behind the auth middleware; Out lists the validated parts, for example { param: UserIdParam; json: UpdateUserFormData } */
export type AuthValidatedContext<Out extends object> = Context<AuthEnv, string, { out: Out }>;
