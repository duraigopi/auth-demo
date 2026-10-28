/* Library imports */
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

/* DynamoDB document client, created once per Lambda container; Lambda supplies the region */
export const dynamoDBClient = DynamoDBDocumentClient.from(new DynamoDBClient({region: 'ap-south-1'}));
