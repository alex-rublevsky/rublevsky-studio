import { drizzle } from "drizzle-orm/d1";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema";
import { resolve } from "path";
import { readdirSync, existsSync } from "fs";


// Dynamically find the SQLite database file in development
function findLocalDbPath() {
  const basePath = resolve("./.wrangler/state/v3/d1/miniflare-D1DatabaseObject");
  
  if (!existsSync(basePath)) return null;
  
  const files = readdirSync(basePath).filter(f => f.endsWith(".sqlite"));
  return files.length > 0 ? resolve(basePath, files[0]) : null;
}

// Initialize database connection based on environment
let db: any;

if (process.env.NODE_ENV === "development") {
  const dbPath = findLocalDbPath();
  
  if (!dbPath) {
    console.warn("No SQLite database found. Using in-memory database.");
    db = drizzleSQLite(new Database(":memory:"), { schema });
  } else {
    console.log("Using local SQLite database:", dbPath);
    db = drizzleSQLite(new Database(dbPath), { schema });
  }
} else {
  db = drizzle(process.env.DB, { schema });
}

export default db;