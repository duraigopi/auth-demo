/* ElectroDB entity for the Users table (PK: user_id), used for sign-in and the user list */

/* Library imports */
import { CustomAttributeType, Entity } from "electrodb";

/* Backend module imports */
import { TABLES, TABLE_INDEXES } from "@backend/constants/tables";
import { USER_ROLE, USER_ROLE_VALUES } from "@backend/constants/user";
import { dynamoDBClient } from "@backend/services/aws-clients";
import { getISOString } from "@backend/utils/time-calculations";
import type { UserRole } from "@backend/types/user";

export const UserEntity = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "authDemo",
    },
    attributes: {
      /* Identity */

      /* PK, generated user identifier */
      user_id: {
        type: "string",
        required: true,
      },
      /* Lowercased on write so the email index lookup is case-insensitive */
      email: {
        type: "string",
        required: true,
        set: (value?: string) => value?.trim().toLowerCase(),
      },
      name: {
        type: "string",
        required: true,
      },

      /* Authentication */

      /* Hash only, the plain password is never stored */
      password_hash: {
        type: "string",
        required: true,
      },

      /* Access */

      role: {
        type: CustomAttributeType<UserRole>("string"),
        required: true,
        enum: USER_ROLE_VALUES,
        default: USER_ROLE.CLIENT,
      },
      /* False blocks sign-in without deleting the row */
      is_active: {
        type: "boolean",
        default: true,
      },

      /* Timestamps */

      /* ISO-8601 UTC, set once on insert */
      created_at: {
        type: "string",
        readOnly: true,
        default: () => getISOString(),
      },
      /* ISO-8601 UTC, bumped on every create or update via watch */
      updated_at: {
        type: "string",
        watch: "*",
        set: () => getISOString(),
      },
    },
    indexes: {
      primary: {
        pk: { field: "user_id", composite: ["user_id"] },
      },
      /* Sign-in and duplicate-email checks look users up by email */
      byEmail: {
        index: TABLE_INDEXES.USERS_BY_EMAIL,
        pk: { field: "email", composite: ["email"] },
      },
    },
  },
  { client: dynamoDBClient, table: TABLES.USERS },
);
