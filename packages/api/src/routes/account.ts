import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { hash } from "@node-rs/argon2";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { getDb, users, sessions, userIdentities } from "@atlas/db";
import { requireAuth } from "../middleware/auth.js";
import type { AppEnv } from "../types.js";

const router = new Hono<AppEnv>();
const s3 = new S3Client({});

function safeUser(user: typeof users.$inferSelect) {
  const {
    passwordHash: _pw,
    billingCustomerId: _cid,
    billingSubscriptionId: _sid,
    ...safe
  } = user;
  return safe;
}

// ─── GET /account/me ──────────────────────────────────────────────────────────

router.get("/me", requireAuth, (c) => {
  return c.json({ user: safeUser(c.get("user")) });
});

// ─── PATCH /account/me ───────────────────────────────────────────────────────

router.patch("/me", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{
    name?: string;
    avatarUrl?: string;
    currentPassword?: string;
    newPassword?: string;
  }>();

  const updates: Partial<typeof users.$inferInsert> = {};

  if (body.name !== undefined) {
    if (!body.name.trim()) {
      return c.json({ error: "name cannot be empty" }, 400);
    }
    updates.name = body.name.trim();
  }

  if (body.avatarUrl !== undefined) {
    updates.avatarUrl = body.avatarUrl || null;
  }

  if (body.newPassword !== undefined) {
    if (!body.currentPassword) {
      return c.json({ error: "currentPassword is required to set a new password" }, 400);
    }
    if (body.newPassword.length < 8) {
      return c.json({ error: "Password must be at least 8 characters" }, 400);
    }
    if (!user.passwordHash) {
      return c.json({ error: "No password set — use OAuth to authenticate" }, 400);
    }

    const { verify: verifyPassword } = await import("@node-rs/argon2");
    const valid = await verifyPassword(user.passwordHash, body.currentPassword);
    if (!valid) {
      return c.json({ error: "Current password is incorrect" }, 401);
    }

    updates.passwordHash = await hash(body.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return c.json({ error: "No fields to update" }, 400);
  }

  const db = getDb();
  const rows = await db.update(users).set(updates).where(eq(users.id, user.id)).returning();
  const updated = rows[0];
  if (!updated) return c.json({ error: "Failed to update user" }, 500);

  return c.json({ user: safeUser(updated) });
});

// ─── POST /account/avatar/upload-url ─────────────────────────────────────────
// Returns a presigned PUT URL so the client can upload directly to S3.

router.post("/avatar/upload-url", requireAuth, async (c) => {
  const user = c.get("user");
  const bucket = process.env["AVATARS_BUCKET"];
  if (!bucket) {
    return c.json({ error: "Avatar storage not configured" }, 503);
  }

  const body = await c.req.json<{ contentType?: string }>().catch(() => ({ contentType: undefined }));
  const contentType = body.contentType ?? "image/jpeg";

  if (!contentType.startsWith("image/")) {
    return c.json({ error: "Only image files are allowed" }, 400);
  }

  const key = `avatars/${user.id}/${Date.now()}`;

  const url = await getSignedUrl(
    s3,
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      ContentType: contentType,
    }),
    { expiresIn: 300 },
  );

  const region = process.env["AWS_REGION"] ?? "eu-west-2";
  const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return c.json({ uploadUrl: url, publicUrl });
});

// ─── DELETE /account/me ──────────────────────────────────────────────────────

router.delete("/me", requireAuth, async (c) => {
  const user = c.get("user");
  const body = await c.req.json<{ confirm?: string }>().catch(() => ({ confirm: undefined }));

  if (body.confirm !== "DELETE") {
    return c.json({ error: 'Confirm deletion by sending { "confirm": "DELETE" }' }, 400);
  }

  const db = getDb();

  await db
    .update(users)
    .set({
      name: "Deleted User",
      email: `deleted+${user.id}@atlas.internal`,
      passwordHash: null,
      emailVerified: false,
    })
    .where(eq(users.id, user.id));

  await db.delete(sessions).where(eq(sessions.userId, user.id));
  await db.delete(userIdentities).where(eq(userIdentities.userId, user.id));

  return c.json({ ok: true, message: "Account deleted. You have been logged out." });
});

export default router;
