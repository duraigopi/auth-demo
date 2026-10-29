/* A field error from server validation */
export interface PayloadValidationError {
  field: string;
  message: string;
}

/* Pagination info from list endpoints */
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

/* Response body for every endpoint */
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

/* Tokens returned by login and refresh */
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}
