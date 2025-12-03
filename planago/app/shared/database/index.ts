import "dotenv/config";
import { drizzle } from "drizzle-orm/postgres-js";
import * as schema from "./schema.ts";

if (!process.env.DATABASE_URL) {
  throw Error("DATABASE_URL is required");
}

export const db = drizzle(process.env.DATABASE_URL, {
  logger: true,
  casing: "snake_case",
  schema,
});
