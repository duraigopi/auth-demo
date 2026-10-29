/* Library imports */
import { Amplify } from "aws-amplify";
import { ApiError, del, get, post, put } from "aws-amplify/api";

/* Lib module imports */
import { AUTH_ENDPOINTS } from "@lib/constants/endpoints";

/* Shared module imports */
import outputs from "@amplifyOutputs";
import type { ApiResponse, AuthTokens } from "@shared/types/api";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@shared/utils/token-storage";

/* Point Amplify at the API from the outputs file */
const configureAmplify = () => {
  /* Configure from the outputs first, then add the REST API, or Amplify ignores the API key */
  Amplify.configure(outputs);
  const existingConfig = Amplify.getConfig();
  Amplify.configure({
    ...existingConfig,
    API: {
      ...existingConfig.API,
      REST: outputs.custom.API,
    },
  });
};

/* Request options, unauth skips the token for public routes */
interface AmplifyApiOptions {
  path: string;
  queryParams?: Record<string, string>;
  unauth?: boolean;
}

/* Adds the JSON body for POST and PUT */
interface AmplifyBodyOptions extends AmplifyApiOptions {
  body?: unknown;
}

type AmplifyBody = NonNullable<NonNullable<Parameters<typeof post>[0]["options"]>["body"]>;

/* Amplify throws on non-2xx, so read the body from the error */
const errorToApiResponse = (error: unknown): ApiResponse<never> => {
  if (error instanceof ApiError && error.response?.body) {
    try {
      return JSON.parse(error.response.body) as ApiResponse<never>;
    } catch {
      /* Not JSON, fall back to the generic message */
    }
  }

  return {
    success: false,
    message: "Unable to reach the server. Please check your connection and try again.",
    error: "NETWORK_ERROR",
    timestamp: new Date().toISOString(),
  };
};

/* One refresh at a time, since the server rotates the token */
let refreshPromise: Promise<boolean> | null = null;

const refreshTokens = () => {
  refreshPromise ??= (async () => {
    const refreshToken = getRefreshToken();
    if (!refreshToken) return false;

    try {
      const { body } = await post({
        apiName: "api",
        path: AUTH_ENDPOINTS.REFRESH,
        options: { headers: { Authorization: `Bearer ${refreshToken}` }, defaultAuthMode: "none" },
      }).response;
      const { success, data } = (await body.json()) as unknown as ApiResponse<AuthTokens>;
      if (!success || !data) return false;

      saveTokens(data);
      return true;
    } catch {
      return false;
    }
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
};

/* Retry once with refreshed tokens on a 401 */
const withAuthRetry = async <R>(perform: (token: string | null) => Promise<R>, unauth = false): Promise<R> => {
  if (unauth) return perform(null);

  try {
    return await perform(getAccessToken());
  } catch (error) {
    if (!(error instanceof ApiError) || error.response?.statusCode !== 401) throw error;

    if (await refreshTokens()) return perform(getAccessToken());

    clearTokens();
    /* No router here, so do a full page reload */
    /* eslint-disable-next-line @next/next/no-location-assign-relative-destination */
    window.location.href = "/auth/login";
    throw error;
  }
};

export const amplifyGet = async <T = unknown>(options: AmplifyApiOptions): Promise<ApiResponse<T>> => {
  configureAmplify();
  const { path, queryParams, unauth } = options;

  try {
    return await withAuthRetry(async (token) => {
      const { body } = await get({
        apiName: "api",
        path,
        /* We send the token ourselves, skip Amplify's credentials */
        options: { queryParams, headers: { ...(token && { Authorization: `Bearer ${token}` }) }, defaultAuthMode: "none" },
      }).response;
      return (await body.json()) as unknown as ApiResponse<T>;
    }, unauth);
  } catch (error) {
    return errorToApiResponse(error);
  }
};

export const amplifyPost = async <T = unknown>(options: AmplifyBodyOptions): Promise<ApiResponse<T>> => {
  configureAmplify();
  const { path, queryParams, body: payload, unauth } = options;

  try {
    return await withAuthRetry(async (token) => {
      const { body } = await post({
        apiName: "api",
        path,
        options: {
          body: payload as AmplifyBody,
          queryParams,
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          defaultAuthMode: "none",
        },
      }).response;
      return (await body.json()) as unknown as ApiResponse<T>;
    }, unauth);
  } catch (error) {
    return errorToApiResponse(error);
  }
};

export const amplifyPut = async <T = unknown>(options: AmplifyBodyOptions): Promise<ApiResponse<T>> => {
  configureAmplify();
  const { path, queryParams, body: payload, unauth } = options;

  try {
    return await withAuthRetry(async (token) => {
      const { body } = await put({
        apiName: "api",
        path,
        options: {
          body: payload as AmplifyBody,
          queryParams,
          headers: { ...(token && { Authorization: `Bearer ${token}` }) },
          defaultAuthMode: "none",
        },
      }).response;
      return (await body.json()) as unknown as ApiResponse<T>;
    }, unauth);
  } catch (error) {
    return errorToApiResponse(error);
  }
};

export const amplifyDelete = async <T = unknown>(options: AmplifyApiOptions): Promise<ApiResponse<T>> => {
  configureAmplify();
  const { path, queryParams, unauth } = options;

  try {
    return await withAuthRetry(async (token) => {
      const { body } = await del({
        apiName: "api",
        path,
        options: { queryParams, headers: { ...(token && { Authorization: `Bearer ${token}` }) }, defaultAuthMode: "none" },
      }).response;
      return (await body.json()) as unknown as ApiResponse<T>;
    }, unauth);
  } catch (error) {
    return errorToApiResponse(error);
  }
};
