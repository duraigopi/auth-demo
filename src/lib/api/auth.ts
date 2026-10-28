/* Lib module imports */
import type { LoginFormData, LoginResponse, SignupRequestBody, UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { AUTH_ENDPOINTS } from "@shared/api/endpoints";
import { amplifyPost } from "@shared/utils/amplify-api";

export const loginApi = (body: LoginFormData) =>
  amplifyPost<LoginResponse>({
    path: AUTH_ENDPOINTS.LOGIN,
    body,
    unauth: true,
  });

export const signupApi = (body: SignupRequestBody) =>
  amplifyPost<UserResponse>({
    path: AUTH_ENDPOINTS.SIGNUP,
    body,
    unauth: true,
  });

export const logoutApi = () =>
  amplifyPost<undefined>({
    path: AUTH_ENDPOINTS.LOGOUT,
  });
