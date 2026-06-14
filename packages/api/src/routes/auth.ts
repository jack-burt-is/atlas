import { Hono } from "hono";
import { eq, and, gt, isNull } from "drizzle-orm";
import { hash, verify as verifyPassword } from "@node-rs/argon2";
import {
  getDb,
  users,
  sessions,
  userIdentities,
  passwordResetTokens,
  emailVerificationTokens,
} from "@atlas/db";
import { generateToken, hashToken } from "../lib/crypto.js";
import { checkRateLimit } from "../lib/rate-limit.js";
import {
  createSession,
  setSessionCookie,
  clearSessionCookie,
  deleteSession,
  deleteUserSessions,
  getSessionId,
} from "../lib/session.js";
import { enqueueEmail } from "../lib/sqs.js";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const auth = new Hono<AppEnv>();

function getIp(c: { req: { header(name: string): string | undefined } }): string | undefined {
  return (
    c.req.header("x-forwarded-for")?.split(",")[0]?.trim() ??
    c.req.header("x-real-ip") ??
    undefined
  );
}

function safeUser(user: typeof users.$inferSelect) {
  const {
    passwordHash: _pw,
    billingCustomerId: _cid,
    billingSubscriptionId: _sid,
    ...safe
  } = user;
  return safe;
}

// ─── Email / password ──────────────────────────────────────────────────────

auth.post("/signup", async (c) => {
  const ip = getIp(c);

  const rl = checkRateLimit(`signup:${ip ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    c.header("Retry-After", String(rl.retryAfterSeconds));
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = await c.req.json<{ email: string; password: string; name: string }>();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return c.json({ error: "email, password, and name are required" }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters" }, 400);
  }

  const db = getDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const passwordHash = await hash(password);

  const newUsers = await db
    .insert(users)
    .values({ email: email.toLowerCase(), name, passwordHash })
    .returning();

  const user = newUsers[0];
  if (!user) return c.json({ error: "Failed to create user" }, 500);

  await db.insert(userIdentities).values({
    userId: user.id,
    provider: "email",
    providerId: user.email,
  });

  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(emailVerificationTokens).values({ userId: user.id, tokenHash, expiresAt });

  const verifyUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:5173"}/verify-email?token=${token}`;
  await enqueueEmail({
    template: "email-verification",
    to: user.email,
    subject: "Verify your Atlas email address",
    props: { name: user.name ?? undefined, verifyUrl },
  });

  const session = await createSession(user.id, ip, c.req.header("user-agent"));
  setSessionCookie(c, session.id);

  return c.json({ user: safeUser(user) }, 201);
});

auth.post("/login", async (c) => {
  const ip = getIp(c);

  const rl = checkRateLimit(`login:${ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    c.header("Retry-After", String(rl.retryAfterSeconds));
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = await c.req.json<{ email: string; password: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "email and password are required" }, 400);
  }

  const db = getDb();

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  const user = rows[0];

  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const session = await createSession(user.id, ip, c.req.header("user-agent"));
  setSessionCookie(c, session.id);

  return c.json({ user: safeUser(user) });
});

auth.post("/logout", async (c) => {
  const sessionId = getSessionId(c);
  if (sessionId) {
    await deleteSession(sessionId);
  }
  clearSessionCookie(c);
  return c.json({ ok: true });
});

auth.post("/forgot-password", async (c) => {
  const ip = getIp(c);

  const rl = checkRateLimit(`forgot-password:${ip ?? "unknown"}`, 3, 60 * 60 * 1000);
  if (!rl.allowed) {
    c.header("Retry-After", String(rl.retryAfterSeconds));
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = await c.req.json<{ email: string }>();
  const { email } = body;

  if (!email) {
    return c.json({ error: "email is required" }, 400);
  }

  const db = getDb();

  const rows = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (rows[0]) {
    const token = generateToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await db.insert(passwordResetTokens).values({ userId: rows[0].id, tokenHash, expiresAt });

    const resetUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:5173"}/reset-password?token=${token}`;
    await enqueueEmail({
      template: "password-reset",
      to: email.toLowerCase(),
      subject: "Reset your Atlas password",
      props: { resetUrl },
    });
  }

  return c.json({ ok: true });
});

auth.post("/reset-password", async (c) => {
  const ip = getIp(c);

  const rl = checkRateLimit(`reset-password:${ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    c.header("Retry-After", String(rl.retryAfterSeconds));
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = await c.req.json<{ token: string; password: string }>();
  const { token, password } = body;

  if (!token || !password) {
    return c.json({ error: "token and password are required" }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters" }, 400);
  }

  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await db
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, now),
        isNull(passwordResetTokens.usedAt),
      ),
    )
    .limit(1);

  const resetToken = rows[0];
  if (!resetToken) {
    return c.json({ error: "Invalid or expired token" }, 400);
  }

  const newPasswordHash = await hash(password);

  await db
    .update(users)
    .set({ passwordHash: newPasswordHash })
    .where(eq(users.id, resetToken.userId));

  await db
    .update(passwordResetTokens)
    .set({ usedAt: now })
    .where(eq(passwordResetTokens.id, resetToken.id));

  await deleteUserSessions(resetToken.userId);

  return c.json({ ok: true });
});

auth.post("/verify-email", async (c) => {
  const body = await c.req.json<{ token: string }>();
  const { token } = body;

  if (!token) {
    return c.json({ error: "token is required" }, 400);
  }

  const db = getDb();
  const tokenHash = hashToken(token);
  const now = new Date();

  const rows = await db
    .select()
    .from(emailVerificationTokens)
    .where(
      and(
        eq(emailVerificationTokens.tokenHash, tokenHash),
        gt(emailVerificationTokens.expiresAt, now),
        isNull(emailVerificationTokens.usedAt),
      ),
    )
    .limit(1);

  const verifyToken = rows[0];
  if (!verifyToken) {
    return c.json({ error: "Invalid or expired token" }, 400);
  }

  await db
    .update(users)
    .set({ emailVerified: true })
    .where(eq(users.id, verifyToken.userId));

  await db
    .update(emailVerificationTokens)
    .set({ usedAt: now })
    .where(eq(emailVerificationTokens.id, verifyToken.id));

  return c.json({ ok: true });
});

auth.post("/resend-verification", requireAuth, async (c) => {
  const user = c.get("user");

  if (user.emailVerified) {
    return c.json({ error: "Email already verified" }, 400);
  }

  const db = getDb();
  const token = generateToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await db.insert(emailVerificationTokens).values({ userId: user.id, tokenHash, expiresAt });

  const verifyUrl = `${process.env["FRONTEND_URL"] ?? "http://localhost:5173"}/verify-email?token=${token}`;
  await enqueueEmail({
    template: "email-verification",
    to: user.email,
    subject: "Verify your Atlas email address",
    props: { name: user.name ?? undefined, verifyUrl },
  });

  return c.json({ ok: true });
});

// ─── Mobile auth (returns session token instead of cookie) ────────────────

auth.post("/mobile/login", async (c) => {
  const ip = getIp(c);

  const rl = checkRateLimit(`mobile-login:${ip ?? "unknown"}`, 10, 60 * 60 * 1000);
  if (!rl.allowed) {
    c.header("Retry-After", String(rl.retryAfterSeconds));
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = await c.req.json<{ email: string; password: string }>();
  const { email, password } = body;

  if (!email || !password) {
    return c.json({ error: "email and password are required" }, 400);
  }

  const db = getDb();

  const rows = await db
    .select()
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  const user = rows[0];

  if (!user || !user.passwordHash) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const valid = await verifyPassword(user.passwordHash, password);
  if (!valid) {
    return c.json({ error: "Invalid credentials" }, 401);
  }

  const session = await createSession(user.id, ip, c.req.header("user-agent"));

  return c.json({ user: safeUser(user), sessionToken: session.id });
});

auth.post("/mobile/signup", async (c) => {
  const ip = getIp(c);

  const rl = checkRateLimit(`mobile-signup:${ip ?? "unknown"}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    c.header("Retry-After", String(rl.retryAfterSeconds));
    return c.json({ error: "Too many requests" }, 429);
  }

  const body = await c.req.json<{ email: string; password: string; name: string }>();
  const { email, password, name } = body;

  if (!email || !password || !name) {
    return c.json({ error: "email, password, and name are required" }, 400);
  }
  if (password.length < 8) {
    return c.json({ error: "Password must be at least 8 characters" }, 400);
  }

  const db = getDb();

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email.toLowerCase()))
    .limit(1);

  if (existing[0]) {
    return c.json({ error: "Email already in use" }, 409);
  }

  const passwordHash = await hash(password);

  const newUsers = await db
    .insert(users)
    .values({ email: email.toLowerCase(), name, passwordHash })
    .returning();

  const user = newUsers[0];
  if (!user) return c.json({ error: "Failed to create user" }, 500);

  await db.insert(userIdentities).values({
    userId: user.id,
    provider: "email",
    providerId: user.email,
  });

  const session = await createSession(user.id, ip, c.req.header("user-agent"));

  return c.json({ user: safeUser(user), sessionToken: session.id }, 201);
});

// ─── Current user ──────────────────────────────────────────────────────────

auth.get("/me", requireAuth, (c) => {
  return c.json({ user: safeUser(c.get("user")) });
});

// ─── Strava OAuth ──────────────────────────────────────────────────────────

auth.get("/strava", (c) => {
  const clientId = process.env["STRAVA_CLIENT_ID"];
  if (!clientId) {
    return c.json({ error: "Strava OAuth not configured" }, 503);
  }

  const state = generateToken();
  const redirectUri =
    process.env["STRAVA_REDIRECT_URI"] ?? "http://localhost:3000/auth/strava/callback";

  c.header(
    "Set-Cookie",
    `strava_oauth_state=${state}; HttpOnly; SameSite=Lax; Path=/; Max-Age=600`,
  );

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    approval_prompt: "auto",
    scope: "activity:read_all",
    state,
  });

  return c.redirect(`https://www.strava.com/oauth/authorize?${params.toString()}`);
});

auth.get("/strava/callback", async (c) => {
  const { code, state, error } = c.req.query();
  const frontendUrl = process.env["FRONTEND_URL"] ?? "http://localhost:5173";

  if (error) {
    return c.redirect(`${frontendUrl}/login?error=strava_denied`);
  }

  const cookieHeader = c.req.header("Cookie") ?? "";
  const storedState = Object.fromEntries(
    cookieHeader
      .split(";")
      .map((part) => part.trim().split("=").slice(0, 2) as [string, string]),
  )["strava_oauth_state"];

  if (!state || !storedState || state !== storedState) {
    return c.json({ error: "Invalid state" }, 400);
  }

  const clientId = process.env["STRAVA_CLIENT_ID"];
  const clientSecret = process.env["STRAVA_CLIENT_SECRET"];
  const redirectUri =
    process.env["STRAVA_REDIRECT_URI"] ?? "http://localhost:3000/auth/strava/callback";

  if (!clientId || !clientSecret) {
    return c.json({ error: "Strava OAuth not configured" }, 503);
  }

  const tokenRes = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  if (!tokenRes.ok) {
    console.error("[auth/strava] token exchange failed:", await tokenRes.text());
    return c.redirect(`${frontendUrl}/login?error=strava_token_failed`);
  }

  const tokens = (await tokenRes.json()) as {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    athlete: { id: number; firstname: string; lastname: string };
  };

  const stravaId = String(tokens.athlete.id);
  const athleteName = `${tokens.athlete.firstname} ${tokens.athlete.lastname}`.trim();
  const tokenExpiresAt = new Date(tokens.expires_at * 1000);

  c.header("Set-Cookie", "strava_oauth_state=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0");

  const db = getDb();
  const ip = getIp(c);
  const now = new Date();

  // If user already has a valid session, link Strava identity to that account
  const existingSessionId = getSessionId(c);
  if (existingSessionId) {
    const sessionRows = await db
      .select({ user: users })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, existingSessionId), gt(sessions.expiresAt, now)))
      .limit(1);

    const sessionRow = sessionRows[0];
    if (sessionRow) {
      await db
        .insert(userIdentities)
        .values({
          userId: sessionRow.user.id,
          provider: "strava",
          providerId: stravaId,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          tokenExpiresAt,
        })
        .onConflictDoUpdate({
          target: [userIdentities.provider, userIdentities.providerId],
          set: {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            tokenExpiresAt,
          },
        });

      return c.redirect(`${frontendUrl}/dashboard`);
    }
  }

  // Find existing Strava identity
  const identityRows = await db
    .select({ identity: userIdentities, user: users })
    .from(userIdentities)
    .innerJoin(users, eq(userIdentities.userId, users.id))
    .where(
      and(eq(userIdentities.provider, "strava"), eq(userIdentities.providerId, stravaId)),
    )
    .limit(1);

  let userId: string;

  if (identityRows[0]) {
    userId = identityRows[0].user.id;

    await db
      .update(userIdentities)
      .set({ accessToken: tokens.access_token, refreshToken: tokens.refresh_token, tokenExpiresAt })
      .where(
        and(eq(userIdentities.provider, "strava"), eq(userIdentities.providerId, stravaId)),
      );
  } else {
    const [newUser] = await db
      .insert(users)
      .values({
        email: `strava-${stravaId}@athlete.atlas.internal`,
        name: athleteName,
        emailVerified: false,
      })
      .returning();

    if (!newUser) return c.json({ error: "Failed to create user" }, 500);
    userId = newUser.id;

    await db.insert(userIdentities).values({
      userId,
      provider: "strava",
      providerId: stravaId,
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt,
    });
  }

  const session = await createSession(userId, ip, c.req.header("user-agent"));
  setSessionCookie(c, session.id);

  return c.redirect(`${frontendUrl}/dashboard`);
});

export default auth;
