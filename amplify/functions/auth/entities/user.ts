/* Library imports */
import { CustomAttributeType, Entity } from "electrodb";

/* Backend module imports */
import { USER_ROLE, USER_ROLE_VALUES } from "@backend/constants/auth";
import { dynamoDBClient } from "@backend/services/aws-clients";
import { getISOString } from "@backend/utils/time-calculations";
import type { UserRole } from "@backend/types/auth";

export const UserEntity = new Entity(
  {
    model: {
      entity: "user",
      version: "1",
      service: "authDemo",
    },
    attributes: {
      /* Partition key, generated when the user is created */
      user_id: {
        type: "string",
        required: true,
      },
      /* Key of the email index; stored lowercase so lookups are case-insensitive */
      email: {
        type: "string",
        required: true,
        set: (value?: string) => value?.trim().toLowerCase(),
      },
      name: {
        type: "string",
        required: true,
      },

      password_hash: {
        type: "string",
        required: true,
      },

      role: {
        type: CustomAttributeType<UserRole>("string"),
        required: true,
        enum: USER_ROLE_VALUES,
        default: USER_ROLE.CLIENT,
      },
      is_active: {
        type: "boolean",
        default: true,
      },

      created_at: {
        type: "string",
        required: true,
        readOnly: true,
        default: () => getISOString(),
      },
      updated_at: {
        type: "string",
        watch: "*",
        set: () => getISOString(),
      },
    },
    indexes: {
      /* Partition key only: one row per user */
      primary: {
        pk: { field: "user_id", composite: ["user_id"] },
      },
      /* Secondary index on email, used by login and the duplicate-email check */
      byEmail: {
        index: "email-index",
        pk: { field: "email", composite: ["email"] },
      },
    },
  },
  { client: dynamoDBClient, table: "Users" },
);
