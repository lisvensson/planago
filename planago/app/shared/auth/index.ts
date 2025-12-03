import "dotenv/config";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../database";
import { betterAuth } from "better-auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
});
