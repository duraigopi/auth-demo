/* Backend module imports */
import { getISOString } from "@backend/utils/time-calculations";
import type { ApiResponse, PaginationMeta, PayloadValidationError } from "@backend/types/api";

/* Builds the body for a successful response */
export const formatSuccessResponse = <T = unknown>({ message, data, count, pagination }: {
  message: string;
  data?: T;
  count?: number;
  pagination?: PaginationMeta;
}): ApiResponse<T> => {
  const response = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(count !== undefined && { count }),
    ...(pagination !== undefined && { pagination }),
    timestamp: getISOString(),
  };

  return response;
};

/* Builds the body for an error response */
export const formatErrorResponse = ({ message, error, validation_errors }: {
  message: string;
  error: string;
  validation_errors?: PayloadValidationError[];
}): ApiResponse => {
  const response = {
    success: false,
    message,
    error,
    ...(validation_errors && { validation_errors }),
    timestamp: getISOString(),
  };

  return response;
};
