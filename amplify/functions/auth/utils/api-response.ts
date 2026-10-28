/* Backend module imports */
import { getISOString } from "@backend/utils/time-calculations";
import type { ApiResponse, PayloadValidationError } from "@backend/types/api";

/* Create standardized success response with optional data and count */
export const formatSuccessResponse = <T = unknown>({ message, data, count }: {
  message: string;
  data?: T;
  count?: number;
}): ApiResponse<T> => {
  const response = {
    success: true,
    message,
    ...(data !== undefined && { data }),
    ...(count !== undefined && { count }),
    timestamp: getISOString(),
  };

  return response;
};

/* Create standardized error response with optional validation errors */
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
