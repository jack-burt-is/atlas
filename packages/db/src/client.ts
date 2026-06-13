import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema/index.js";

let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (_db) return _db;

  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is not set");

  const pool = new Pool({
    connectionString,
    max: 1, // Lambda: keep connection count low behind RDS Proxy
    idleTimeoutMillis: 0,
    connectionTimeoutMillis: 5_000,
  });

  _db = drizzle(pool, { schema });
  return _db;
}
