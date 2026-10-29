/* Library imports */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/* Reused across invocations, the region comes from the Lambda environment */
export const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient());
