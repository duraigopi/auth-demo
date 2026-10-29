"use client";

/* Library imports */
import { useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/* Shared module imports */
import { showApiErrorToast, showSuccessToast } from "@shared/utils/notifications";
import type { ApiResponse, PaginationMeta } from "@shared/types/api";

/* Shape of the cached query data */
interface QueryCacheData<T> {
  data: T;
  count?: number;
  pagination?: PaginationMeta;
}

export interface UseApiQueryOptions<T> {
  queryKey: unknown[];
  queryFn: () => Promise<ApiResponse<T>>;
  enabled?: boolean;
  showErrorToast?: boolean;
  keepPreviousData?: boolean;
  retry?: number | boolean;
}

export interface UseApiQueryReturn<T> {
  data: T | null;
  count: number | null;
  pagination: PaginationMeta | null;
  isLoading: boolean;
  isFetching: boolean;
  isError: boolean;
  error: string | null;
  errorResponse: ApiResponse<unknown> | null;
  refetch: () => Promise<void>;
}

/* GET hook, shows a toast when the response fails */
export const useApiQuery = <T,>({
  queryKey,
  queryFn,
  enabled = true,
  showErrorToast: shouldShowErrorToast = true,
  keepPreviousData = false,
  retry = false,
}: UseApiQueryOptions<T>): UseApiQueryReturn<T> => {
  const query = useQuery<QueryCacheData<T>, ApiResponse<unknown>>({
    queryKey,
    enabled,
    retry,
    placeholderData: keepPreviousData ? (previous) => previous : undefined,
    queryFn: async () => {
      const response = await queryFn();

      if (!response.success) {
        if (shouldShowErrorToast) showApiErrorToast(response, "Failed to Load Data");
        /* Throw the whole response so callers can read validation_errors */
        throw response;
      }

      return {
        data: response.data as T,
        count: response.count,
        pagination: response.pagination,
      };
    },
  });

  const errorResponse = query.error;

  return {
    data: query.data?.data ?? null,
    count: query.data?.count ?? null,
    pagination: query.data?.pagination ?? null,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: errorResponse?.error ?? errorResponse?.message ?? null,
    errorResponse: errorResponse ?? null,
    refetch: async () => {
      await query.refetch();
    },
  };
};

export interface UseApiMutationOptions<TData, TVariables> {
  mutationKey?: string[];
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>;
  invalidateQueryKeys?: unknown[][];
  showSuccessToast?: boolean;
  showErrorToast?: boolean;
  successTitle?: string;
  successDescription?: string;
  errorTitle?: string;
  onSuccess?: (data: TData) => void;
  onError?: (response: ApiResponse<unknown>) => void;
}

export interface UseApiMutationReturn<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  data: TData | null;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  error: string | null;
  errorResponse: ApiResponse<unknown> | null;
  reset: () => void;
}

/* POST, PUT and DELETE hook, refreshes the given queries when the request ends */
export const useApiMutation = <TData, TVariables>({
  mutationKey,
  mutationFn,
  invalidateQueryKeys,
  showSuccessToast: shouldShowSuccessToast = true,
  showErrorToast: shouldShowErrorToast = true,
  successTitle = "Success",
  successDescription = "Operation completed successfully.",
  errorTitle = "Operation Failed",
  onSuccess,
  onError,
}: UseApiMutationOptions<TData, TVariables>): UseApiMutationReturn<TData, TVariables> => {
  const queryClient = useQueryClient();
  /* Two clicks in the same tick both see isPending as false, so this blocks the second one */
  const inFlight = useRef(false);

  const mutation = useMutation<TData, ApiResponse<unknown>, TVariables>({
    mutationKey,
    mutationFn: async (variables) => {
      const response = await mutationFn(variables);

      if (!response.success) {
        throw response;
      }

      /* Some endpoints only return a message, so data can be undefined */
      return response.data as TData;
    },
    onSuccess: (data) => {
      if (shouldShowSuccessToast) {
        showSuccessToast({ title: successTitle, description: successDescription });
      }

      onSuccess?.(data);
    },
    onError: (response) => {
      if (shouldShowErrorToast) {
        showApiErrorToast(response, errorTitle);
      }

      onError?.(response);
    },
    onSettled: () => {
      inFlight.current = false;

      /* Also after a failure, the row may have been changed or removed by someone else */
      invalidateQueryKeys?.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
    },
  });

  const mutate = (variables: TVariables) => {
    if (inFlight.current) return;
    inFlight.current = true;
    mutation.mutate(variables);
  };

  const errorResponse = mutation.error;

  return {
    mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data ?? null,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    isSuccess: mutation.isSuccess,
    error: errorResponse?.error ?? errorResponse?.message ?? null,
    errorResponse: errorResponse ?? null,
    reset: mutation.reset,
  };
};
