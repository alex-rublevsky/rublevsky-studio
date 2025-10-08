import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "sqlite",
  schema: "./src/schema.ts",
  out: "./drizzle",
  driver: "d1-http",
  dbCredentials: {
    accountId: process.env.CLOUDFLARE_D1_ACCOUNT_ID!,
    databaseId: process.env.DATABASE!,
    token: process.env.CLOUDFLARE_D1_API_TOKEN!,
  },
});
