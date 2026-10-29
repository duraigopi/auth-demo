/* Library imports */
import type { Context, Env } from "hono";

/* Backend module imports */
import type { AuthContext } from "@backend/types/auth";

/* One failed field in a rejected request, returned in validation_errors */
export interface PayloadValidationError {
  field: string;
  message: string;
}

/* Page info returned by list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/* Response body used by every endpoint, built by formatSuccessResponse and formatErrorResponse */
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

/* Context with a validated JSON body, used by signup, login and refresh */
export type ValidatedJsonContext<T> = Context<Env, string, { out: { json: T } }>;

/* Hono env for routes behind authMiddleware, it gives handlers c.var.auth */
export interface AuthEnv extends Env {
  Variables: {
    auth: AuthContext;
  };
}

/* Context behind authMiddleware plus validated request parts */
export type AuthValidatedContext<Out extends object> = Context<AuthEnv, string, { out: Out }>;
