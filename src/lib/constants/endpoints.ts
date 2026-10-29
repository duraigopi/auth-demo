export const AUTH_ENDPOINTS = {
  SETUP_ADMIN: "/api/v1/auth/setup-admin",
  SIGNUP: "/api/v1/auth/signup",
  LOGIN: "/api/v1/auth/login",
  REFRESH: "/api/v1/auth/refresh",
  LOGOUT: "/api/v1/auth/logout",
} as const;

export const ME_ENDPOINTS = {
  PROFILE: "/api/v1/me",
  PASSWORD: "/api/v1/me/password",
} as const;

export const USER_ENDPOINTS = {
  LIST: "/api/v1/users",
  BY_ID: (userId: string) => `/api/v1/users/${userId}`,
  ENABLE: (userId: string) => `/api/v1/users/${userId}/enable`,
  DISABLE: (userId: string) => `/api/v1/users/${userId}/disable`,
} as const;
