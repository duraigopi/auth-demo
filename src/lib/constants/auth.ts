/* Lib module imports */
import type { UserRole, UserStatus } from "@lib/types/auth";

/* User roles, same values as the API */
export const USER_ROLES = {
  ADMIN: "ADMIN",
  CLIENT: "CLIENT",
} as const;

export const USER_ROLE_VALUES: UserRole[] = Object.values(USER_ROLES);

/* Role choices for the select fields */
export const USER_ROLE_CHOICES = [
  { label: "Admin", value: USER_ROLES.ADMIN },
  { label: "Client", value: USER_ROLES.CLIENT },
];

/* Account status filter on the users list, the API takes it as is_active */
export const USER_STATUSES = {
  ACTIVE: "active",
  INACTIVE: "inactive",
} as const;

export const USER_STATUS_VALUES: UserStatus[] = Object.values(USER_STATUSES);

/* Choice that clears a filter, it is not a real role or status so the URL parser turns it into null */
export const FILTER_ALL = "all";

/* Filter select choices, each starts with the "all" option */
export const ROLE_FILTER_CHOICES = [
  { label: "All roles", value: FILTER_ALL }, 
  ...USER_ROLE_CHOICES
];

export const STATUS_FILTER_CHOICES = [
  { label: "All statuses", value: FILTER_ALL },
  { label: "Active", value: USER_STATUSES.ACTIVE },
  { label: "Inactive", value: USER_STATUSES.INACTIVE },
];

