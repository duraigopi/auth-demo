/* Shared module imports */
import type { AuthTokens } from "@shared/types/api";

const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

/* null on the server, localStorage is browser only */
const readToken = (key: string) => (typeof window === "undefined" ? null : window.localStorage.getItem(key));

export const getAccessToken = () => readToken(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => readToken(REFRESH_TOKEN_KEY);

export const saveTokens = ({ accessToken, refreshToken }: AuthTokens) => {
  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
};

export const clearTokens = () => {
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
};
