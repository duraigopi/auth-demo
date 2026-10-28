/* Library imports */
import { Entity } from "electrodb";

/* Backend module imports */
import { dynamoDBClient } from "@backend/services/aws-clients";
import { getISOString } from "@backend/utils/time-calculations";

export const LoginAttemptEntity = new Entity(
  {
    model: {
      entity: "loginAttempt",
      version: "1",
      service: "authDemo",
    },
    attributes: {
      /* Partition key; lowercased the same way as the email on users */
      email: {
        type: "string",
        required: true,
        set: (value?: string) => value?.trim().toLowerCase(),
      },

      failed_count: {
        type: "number",
        default: 0,
      },
      locked_until: {
        type: "string",
      },
      ttl: {
        type: "number",
        required: true,
      },

      updated_at: {
        type: "string",
        watch: "*",
        set: () => getISOString(),
      },
    },
    indexes: {
      /* Partition key only: one counter row per email */
      primary: {
        pk: { field: "email", composite: ["email"] },
      },
    },
  },
  { client: dynamoDBClient, table: "LoginAttempts" },
);
