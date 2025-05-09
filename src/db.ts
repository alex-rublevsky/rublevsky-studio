import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { DrizzleD1Database } from "drizzle-orm/d1";

// Define a union type for our database instance
export type DB = DrizzleD1Database<typeof schema> | BetterSQLite3Database<typeof schema>;

let db: DB;

// Helper function to get D1 database instance
function getD1Database() {
  // Check for Cloudflare Workers environment
  if (typeof globalThis !== 'undefined' && 'Deno' in globalThis === false) {
    const env = (globalThis as any).process?.env || {};
    const context = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env;
    return context?.DB || env.DB;
  }
  return null;
}

const d1 = getD1Database();

if (d1) {
  // We have a D1 database (either in production or using wrangler)
  db = drizzle(d1, { schema });
} else {
  // Fallback to SQLite for local development
  try {
    const sqlite = new Database('./.wrangler/state/v3/d1/miniflare-D1DatabaseObject/db.sqlite');
    db = drizzleSQLite(sqlite, { schema });
    
    if (import.meta.env.DEV) {
      console.log("Using local SQLite database");
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Failed to initialize SQLite database. Make sure to run 'wrangler d1 execute rublevsky-studio-storage --local' first:", error);
    }
    throw error;
  }
}

export default db;