import { type MiddlewareHandler } from "hono";
import { eq, gt, and } from "drizzle-orm";
import { getDb, sessions, users } from "@atlas/db";
import { getSessionId } from "../lib/session.js";
import type { AppEnv } from "../types.js";

function getBearerToken(c: Parameters<MiddlewareHandler>[0]): string | undefined {
  const header = c.req.header("authorization");
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return undefined;
}

export const requireAuth: MiddlewareHandler<AppEnv> = async (c, next) => {
  const sessionId = getSessionId(c) ?? getBearerToken(c);
  if (!sessionId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const db = getDb();
  const now = new Date();

  const rows = await db
    .select({ session: sessions, user: users })
    .from(sessions)
    .innerJoin(users, eq(sessions.userId, users.id))
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
    .limit(1);

  const row = rows[0];
  if (!row) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("user", row.user);
  c.set("session", row.session);
  await next();
};
