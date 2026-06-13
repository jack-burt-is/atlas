import { eq } from "drizzle-orm";
import { getCookie, setCookie, deleteCookie } from "hono/cookie";
import { getDb, sessions } from "@atlas/db";
import type { Context } from "hono";

const COOKIE_NAME = "sid";
const SESSION_DAYS = 30;
const SESSION_MAX_AGE = SESSION_DAYS * 24 * 60 * 60;

export async function createSession(
  userId: string,
  ip: string | undefined,
  userAgent: string | undefined,
) {
  const db = getDb();
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000);

  const rows = await db
    .insert(sessions)
    .values({ userId, expiresAt, ip, userAgent })
    .returning();

  const session = rows[0];
  if (!session) throw new Error("Failed to create session");
  return session;
}

export function getSessionId(c: Context): string | undefined {
  return getCookie(c, COOKIE_NAME);
}

export function setSessionCookie(c: Context, sessionId: string): void {
  setCookie(c, COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env["NODE_ENV"] === "production",
    sameSite: "Lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export function clearSessionCookie(c: Context): void {
  deleteCookie(c, COOKIE_NAME, { path: "/" });
}

export async function deleteSession(sessionId: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

export async function deleteUserSessions(userId: string): Promise<void> {
  const db = getDb();
  await db.delete(sessions).where(eq(sessions.userId, userId));
}
