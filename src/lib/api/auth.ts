/* Lib module imports */
import type { LoginFormData, LoginResponseData, PublicUser, SignupRequestBody } from "@lib/types/auth";

/* Shared module imports */
import { AUTH_ENDPOINTS } from "@shared/api/endpoints";
import { amplifyPost } from "@shared/utils/amplify-api";

export const loginApi = (body: LoginFormData) =>
  amplifyPost<LoginResponseData>({ path: AUTH_ENDPOINTS.LOGIN, body, unauth: true });

export const signupApi = (body: SignupRequestBody) =>
  amplifyPost<PublicUser>({ path: AUTH_ENDPOINTS.SIGNUP, body, unauth: true });

export const logoutApi = () => amplifyPost<undefined>({ path: AUTH_ENDPOINTS.LOGOUT });
