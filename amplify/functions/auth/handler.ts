/* Library imports */
import { Hono } from "hono";
import { handle } from "@hono/aws-lambda";

/* Exported so an OpenAPI generator can read the mounted routes later */
export const app = new Hono();

export const handler = handle(app);
