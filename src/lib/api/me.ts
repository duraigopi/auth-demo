/* Lib module imports */
import type { ChangePasswordBody, PublicUser, UpdateProfileBody } from "@lib/types/auth";

/* Shared module imports */
import { ME_ENDPOINTS } from "@shared/api/endpoints";
import { amplifyGet, amplifyPut } from "@shared/utils/amplify-api";

export const getMeApi = () => amplifyGet<PublicUser>({ path: ME_ENDPOINTS.PROFILE });

export const updateMeApi = (body: UpdateProfileBody) =>
  amplifyPut<undefined>({ path: ME_ENDPOINTS.PROFILE, body });

export const changePasswordApi = (body: ChangePasswordBody) =>
  amplifyPut<undefined>({ path: ME_ENDPOINTS.PASSWORD, body });
