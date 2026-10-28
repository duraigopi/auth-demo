/* ElectroDB entity for the Sessions table (PK: session_id), one row per login so a session can be revoked */

/* Library imports */
import { Entity } from "electrodb";

/* Backend module imports */
import { TABLES, TABLE_INDEXES } from "@backend/constants/tables";
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
      /* Identity */

      /* PK, generated session identifier carried inside both tokens */
      session_id: {
        type: "string",
        required: true,
      },
      user_id: {
        type: "string",
        required: true,
      },

      /* Authentication */

      /* Id of the newest refresh token, so an older token stops working as soon as a new one is issued */
      refresh_token: {
        type: "string",
        required: true,
      },
      /* True after logout or a password change, which blocks further refreshes */
      is_revoked: {
        type: "boolean",
        default: false,
      },

      /* Lifetime */

      /* DynamoDB TTL attribute in Unix seconds; the table must have TTL enabled on it */
      ttl: {
        type: "number",
        required: true,
      },

      /* Timestamps */

      /* ISO-8601 UTC, set once on insert */
      created_at: {
        type: "string",
        readOnly: true,
        default: () => getISOString(),
      },
    },
    indexes: {
      primary: {
        pk: { field: "session_id", composite: ["session_id"] },
      },
      /* Lists or revokes every session of one user */
      byUser: {
        index: TABLE_INDEXES.SESSIONS_BY_USER,
        pk: { field: "user_id", composite: ["user_id"] },
      },
    },
  },
  { client: dynamoDBClient, table: TABLES.SESSIONS },
);
