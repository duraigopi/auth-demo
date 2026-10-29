/* Library imports */
import { Entity } from "electrodb";

/* Backend module imports */
import { dynamoDBClient } from "@backend/services/aws-clients";
import { getISOString } from "@backend/utils/time-calculations";

export const SessionEntity = new Entity(
  {
    model: {
      entity: "session",
      version: "1",
      service: "authDemo",
    },
    attributes: {
      /* Partition key, generated at login and included in both tokens */
      session_id: {
        type: "string",
        required: true,
      },
      /* Key of the user index, links the session to its user */
      user_id: {
        type: "string",
        required: true,
      },

      refresh_token: {
        type: "string",
        required: true,
      },
      is_revoked: {
        type: "boolean",
        default: false,
      },

      ttl: {
        type: "number",
        required: true,
      },

      created_at: {
        type: "string",
        readOnly: true,
        default: () => getISOString(),
      },
    },
    indexes: {
      /* Partition key only: one row per login session, casing none keeps the id exactly as generated */
      primary: {
        pk: { field: "session_id", composite: ["session_id"], casing: "none" },
      },
      /* Secondary index on user_id, used to find every session of a user (password change) */
      byUser: {
        index: "user_id-index",
        pk: { field: "user_id", composite: ["user_id"] },
      },
    },
  },
  { client: dynamoDBClient, table: "Sessions" },
);
