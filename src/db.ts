import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { resolve } from "path";
import { readdirSync, existsSync } from "fs";
import type { BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import type { DrizzleD1Database } from "drizzle-orm/d1";

// Define a union type for our database instance
export type DB = DrizzleD1Database<typeof schema> | BetterSQLite3Database<typeof schema>;

// Check if we're in production/Workers environment
const isProduction = typeof process === 'undefined' || typeof globalThis.caches !== 'undefined';

let db: DB;

if (isProduction) {
  // In production/Workers environment, use D1
  const d1 = (globalThis as any)[Symbol.for("__cloudflare-context__")]?.env?.DB;
  if (!d1) {
    throw new Error('Database binding not found in Cloudflare context');
  }
  db = drizzle(d1, { schema }) as DrizzleD1Database<typeof schema>;
} else {
  // In development, use local SQLite database
  const basePath = resolve("./.wrangler/state/v3/d1/miniflare-D1DatabaseObject");
  
  if (!existsSync(basePath)) {
    throw new Error(
      "No SQLite database directory found. Please run 'pnpm dev' first to initialize the local database."
    );
  }
  
  const files = readdirSync(basePath).filter(f => f.endsWith(".sqlite"));
  if (files.length === 0) {
    throw new Error(
      "No SQLite database file found. Please run 'pnpm dev' first to initialize the local database."
    );
  }
  
  const dbPath = resolve(basePath, files[0]);
  // Only log in development, not during builds
  if (process.env.NODE_ENV === 'development') {
    console.log("Using local SQLite database:", dbPath);
  }
  db = drizzleSQLite(new Database(dbPath), { schema }) as BetterSQLite3Database<typeof schema>;
}

export default db;