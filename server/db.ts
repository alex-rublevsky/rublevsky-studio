import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { resolve } from "path";
import { readdirSync, existsSync } from "fs";

// Check if we're in production/Workers environment
const isProduction = process.env.NODE_ENV === 'production' ||    // Build-time check
                    typeof process === 'undefined' ||            // Runtime check for Workers
                    typeof globalThis.caches !== 'undefined';    // Runtime check for Workers

let db: any;

if (isProduction) {
  // In production/Workers environment, create a function that gets the DB from context
  db = {
    prepare: () => {
      // @ts-ignore - Cloudflare Workers specific
      const env = globalThis[Symbol.for("__cloudflare-context__")]?.env;
      if (!env?.DB) throw new Error('Database binding not found in Cloudflare context');
      return drizzle(env.DB, { schema });
    }
  };

  // Wrap all database operations to use the prepared DB
  const handler = {
    get(target: any, prop: string) {
      if (prop === 'prepare') return target.prepare;
      
      return (...args: any[]) => {
        const preparedDb = target.prepare();
        return preparedDb[prop](...args);
      };
    }
  };

  db = new Proxy(db, handler);
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
  db = drizzleSQLite(new Database(dbPath), { schema });
}

export default db;