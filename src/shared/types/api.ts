/* One field that failed validation on the server */
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

/* Response body used by every API endpoint */
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

/* The two tokens returned by login and refresh */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
