/* Lib module imports */
import { ME_ENDPOINTS } from "@lib/constants/endpoints";
import type { ChangePasswordBody, UpdateProfileBody, UserResponse } from "@lib/types/auth";

/* Shared module imports */
import { amplifyGet, amplifyPut } from "@shared/utils/amplify-api";

export const getMeApi = () =>
  amplifyGet<UserResponse>({
    path: ME_ENDPOINTS.PROFILE,
  });

export const updateMeApi = (body: UpdateProfileBody) =>
  amplifyPut<undefined>({
    path: ME_ENDPOINTS.PROFILE,
    body,
  });

export const changePasswordApi = (body: ChangePasswordBody) =>
  amplifyPut<undefined>({
    path: ME_ENDPOINTS.PASSWORD,
    body,
  });
