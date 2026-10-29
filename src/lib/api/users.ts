/* Lib module imports */
import { USER_ENDPOINTS } from "@lib/constants/endpoints";
import type {
  CreateUserBody,
  UpdateUserBody,
  UserListParams,
  UserListResponse,
  UserResponse,
} from "@lib/types/auth";

/* Shared module imports */
import { amplifyDelete, amplifyGet, amplifyPost, amplifyPut } from "@shared/utils/amplify-api";

export const listUsersApi = (params: UserListParams) =>
  amplifyGet<UserListResponse>({
    path: USER_ENDPOINTS.LIST,
    queryParams: Object.fromEntries(
      Object.entries(params)
        .filter(([, value]) => !!value)
        .map(([key, value]) => [key, String(value)]),
    ),
  });

export const getUserApi = (userId: string) =>
  amplifyGet<UserResponse>({
    path: USER_ENDPOINTS.BY_ID(userId),
  });

export const createUserApi = (body: CreateUserBody) =>
  amplifyPost<undefined>({
    path: USER_ENDPOINTS.LIST,
    body,
  });

export const updateUserApi = (userId: string, body: UpdateUserBody) =>
  amplifyPut<undefined>({
    path: USER_ENDPOINTS.BY_ID(userId),
    body,
  });

export const deleteUserApi = (userId: string) =>
  amplifyDelete<undefined>({
    path: USER_ENDPOINTS.BY_ID(userId),
  });

export const enableUserApi = (userId: string) =>
  amplifyPost<undefined>({
    path: USER_ENDPOINTS.ENABLE(userId),
  });

export const disableUserApi = (userId: string) =>
  amplifyPost<undefined>({
    path: USER_ENDPOINTS.DISABLE(userId),
  });
