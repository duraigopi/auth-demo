/* ElectroDB entity for the LoginAttempts table (PK: email), counts failed sign-ins so an account can be locked briefly */

/* Library imports */
import { Entity } from "electrodb";

/* Backend module imports */
import { TABLES } from "@backend/constants/auth";
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
      /* Identity */

      /* PK, lowercased like the Users email so both tables agree */
      email: {
        type: "string",
        required: true,
        set: (value?: string) => value?.trim().toLowerCase(),
      },

      /* Lockout */

      failed_count: {
        type: "number",
        default: 0,
      },
      /* ISO-8601 UTC, sign-in is refused until this time passes */
      locked_until: {
        type: "string",
      },
      /* DynamoDB TTL attribute in Unix seconds; the table must have TTL enabled on it */
      ttl: {
        type: "number",
        required: true,
      },

      /* Timestamps */

      /* ISO-8601 UTC, bumped on every create or update via watch */
      updated_at: {
        type: "string",
        watch: "*",
        set: () => getISOString(),
      },
    },
    indexes: {
      primary: {
        pk: { field: "email", composite: ["email"] },
      },
    },
  },
  { client: dynamoDBClient, table: TABLES.LOGIN_ATTEMPTS },
);
