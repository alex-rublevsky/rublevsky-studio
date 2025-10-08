import { drizzle, type DrizzleD1Database } from "drizzle-orm/d1";
import { env } from "cloudflare:workers";
import * as schema from "~/schema";

export function DB(): DrizzleD1Database<typeof schema> {
  return drizzle(env.DB, { schema });
}
