/*
 * Empties the Users, Sessions and LoginAttempts tables, and can create the users from users.json.
 *
 * Run from the project root:
 *   npm run seed:users               (shows what is in the tables, then asks what to do)
 *   npm run seed:users -- --dry-run  (only shows what would happen, changes nothing)
 *
 * At the prompt, type:
 *   delete   to only empty the tables
 *   seed     to empty the tables, then create the users from users.json
 *   anything else cancels
 *
 * It uses the AWS login of this machine and the region in AWS_REGION (default ap-southeast-1).
 */

/* Library imports */
import { readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { BatchWriteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { nanoid } from "nanoid";

/* Backend module imports */
import type { UserRole } from "@backend/types/auth";

/* The entities read the region when they load, so it is set before they are imported */
process.env.AWS_REGION ??= "ap-southeast-1";
const { USER_ROLE_VALUES } = await import("@backend/constants/auth");
const { UserEntity } = await import("@backend/entities/user");
const { dynamoDBClient } = await import("@backend/services/aws-clients");
const { hashPassword } = await import("@backend/utils/password");

/* Shape of users.json */
interface SeedFile {
  password: string;
  users: { name: string; email: string; role: UserRole }[];
}

/* Each table and the name of its key attribute */
const TABLES = [
  { name: "Users", key: "user_id" },
  { name: "Sessions", key: "session_id" },
  { name: "LoginAttempts", key: "email" },
];

/* Reads users.json, only the seed choice needs it */
const loadSeed = () => JSON.parse(readFileSync(new URL("./users.json", import.meta.url), "utf-8")) as SeedFile;

/* Stops early on a bad users.json, before anything is deleted */
const validate = ({ password, users }: SeedFile) => {
  if (!password) throw new Error("users.json needs a password");
  const emails = new Set<string>();
  for (const user of users) {
    if (!user.name || user.name.length > 100) throw new Error(`Bad name: ${user.name}`);
    if (user.email !== user.email.toLowerCase().trim()) throw new Error(`Email must be lowercase: ${user.email}`);
    if (!USER_ROLE_VALUES.includes(user.role)) throw new Error(`Bad role for ${user.email}: ${user.role}`);
    if (emails.has(user.email)) throw new Error(`Duplicate email: ${user.email}`);
    emails.add(user.email);
  }
};

/* Reads every key of a table, following the pages of the scan */
const scanKeys = async (table: string, key: string) => {
  const keys: string[] = [];
  let startKey: Record<string, unknown> | undefined;
  do {
    const { Items = [], LastEvaluatedKey } = await dynamoDBClient.send(
      new ScanCommand({
        TableName: table,
        ProjectionExpression: "#key",
        ExpressionAttributeNames: { "#key": key },
        ExclusiveStartKey: startKey,
      }),
    );
    keys.push(...Items.map((item) => String(item[key])));
    startKey = LastEvaluatedKey;
  } while (startKey);
  return keys;
};

/* Deletes keys in batches of 25, which is the DynamoDB limit, and retries what it did not process */
const deleteKeys = async (table: string, key: string, keys: string[]) => {
  for (let i = 0; i < keys.length; i += 25) {
    let requests = keys.slice(i, i + 25).map((value) => ({ DeleteRequest: { Key: { [key]: value } } }));
    while (requests.length > 0) {
      const { UnprocessedItems } = await dynamoDBClient.send(new BatchWriteCommand({ RequestItems: { [table]: requests } }));
      requests = (UnprocessedItems?.[table] ?? []) as typeof requests;
    }
  }
};

const found = await Promise.all(TABLES.map(async (table) => ({ ...table, keys: await scanKeys(table.name, table.key) })));

console.log(`Region: ${process.env.AWS_REGION}`);
for (const table of found) console.log(`  ${table.name}: ${table.keys.length} item(s) found`);

if (process.argv.includes("--dry-run")) {
  console.log('Dry run, nothing was changed. "delete" would empty these tables, "seed" would also create the users.');
  process.exit(0);
}

const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = (
  await rl.question('Type "delete" to only delete, or "seed" to delete and then create the users from users.json: ')
).trim();
rl.close();

if (answer !== "delete" && answer !== "seed") {
  console.log("Cancelled, nothing was changed.");
  process.exit(0);
}

/* Checked before anything is deleted, so a bad file stops the run early */
const seed = answer === "seed" ? loadSeed() : undefined;
if (seed) validate(seed);

for (const table of found) {
  await deleteKeys(table.name, table.key, table.keys);
  console.log(`Emptied ${table.name}`);
}

if (!seed) {
  console.log("Done, nothing was created.");
  process.exit(0);
}

/* Creation dates are spread over the last days, so the date filters have something to show */
const now = Date.now();
for (const [index, user] of seed.users.entries()) {
  const daysAgo = seed.users.length - index;
  await UserEntity.create({
    user_id: nanoid(),
    email: user.email,
    name: user.name,
    password_hash: await hashPassword(seed.password),
    role: user.role,
    created_at: new Date(now - daysAgo * 24 * 60 * 60 * 1000).toISOString(),
  }).go();
  console.log(`Created ${user.email} (${user.role})`);
}

console.log(`Done: ${seed.users.length} users created.`);
