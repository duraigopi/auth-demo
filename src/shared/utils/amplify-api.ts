/* Library imports */
import { Amplify } from "aws-amplify";
import { ApiError, del, get, post, put } from "aws-amplify/api";

/* Shared module imports */
import outputs from "@amplifyOutputs";
import { AUTH_ENDPOINTS } from "@shared/api/endpoints";
import type { ApiResponse, AuthTokens } from "@shared/types/api";
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from "@shared/utils/token-storage";

/* Points Amplify's REST client at the deployed API; the endpoint comes from the backend's outputs file */
const configureAmplify = () => {
  Amplify.configure({
    ...outputs,
    API: {
      REST: outputs.custom.API,
    },
  });
};

/* Options for every wrapper; unauth is for the public routes (login, signup) */
interface AmplifyApiOptions {
  path: string;
  queryParams?: Record<string, string>;
  unauth?: boolean;
}

/* Same as above, plus the JSON body for POST and PUT */
interface AmplifyBodyOptions extends AmplifyApiOptions {
  body?: unknown;
}

type AmplifyBody = NonNullable<NonNullable<Parameters<typeof post>[0]["options"]>["body"]>;

/* Amplify throws on non-2xx, so read the server's body from the error; anything else is a network failure */
const errorToApiResponse = (error: unknown): ApiResponse<never> => {
  if (error instanceof ApiError && error.response?.body) {
    try {
      return JSON.parse(error.response.body) as ApiResponse<never>;
    } catch {
      /* Not JSON, so use the generic message */
    }
  }

  return {
    success: false,
    message: "Unable to reach the server. Please check your connection and try again.",
    error: "NETWORK_ERROR",
    timestamp: new Date().toISOString(),
  };
};

/* Only one refresh runs at a time, because the server rotates the refresh token */
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

/* Runs a request with the access token; on a 401 it refreshes the tokens once and runs it again */
const withAuthRetry = async <R>(perform: (token: string | null) => Promise<R>, unauth = false): Promise<R> => {
  if (unauth) return perform(null);

  try {
    return await perform(getAccessToken());
  } catch (error) {
    if (!(error instanceof ApiError) || error.response?.statusCode !== 401) throw error;

    if (await refreshTokens()) return perform(getAccessToken());

    clearTokens();
    /* No router outside components, and the full reload also drops any cached user data */
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
        /* Auth is the bearer header, so skip Amplify's own credential lookup */
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
