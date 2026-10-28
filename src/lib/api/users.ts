/* Lib module imports */
import type { CreateUserBody, PublicUser, UpdateUserBody, UserListParams } from "@lib/types/auth";

/* Shared module imports */
import { USER_ENDPOINTS } from "@shared/api/endpoints";
import { amplifyDelete, amplifyGet, amplifyPost, amplifyPut } from "@shared/utils/amplify-api";

export const listUsersApi = (params: UserListParams) =>
  amplifyGet<PublicUser[]>({
    path: USER_ENDPOINTS.LIST,
    /* Amplify only takes strings here */
    queryParams: Object.fromEntries(Object.entries(params).map(([key, value]) => [key, String(value)])),
  });

export const getUserApi = (userId: string) => amplifyGet<PublicUser>({ path: USER_ENDPOINTS.BY_ID(userId) });

export const createUserApi = (body: CreateUserBody) => amplifyPost<undefined>({ path: USER_ENDPOINTS.LIST, body });

export const updateUserApi = (userId: string, body: UpdateUserBody) =>
  amplifyPut<undefined>({ path: USER_ENDPOINTS.BY_ID(userId), body });

export const deleteUserApi = (userId: string) => amplifyDelete<undefined>({ path: USER_ENDPOINTS.BY_ID(userId) });

export const enableUserApi = (userId: string) => amplifyPost<undefined>({ path: USER_ENDPOINTS.ENABLE(userId) });

export const disableUserApi = (userId: string) => amplifyPost<undefined>({ path: USER_ENDPOINTS.DISABLE(userId) });
