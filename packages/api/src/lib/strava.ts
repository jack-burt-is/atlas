import { eq, and } from "drizzle-orm";
import { getDb, userIdentities } from "@atlas/db";

interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

export async function refreshStravaToken(userId: string): Promise<string> {
  const db = getDb();

  const rows = await db
    .select()
    .from(userIdentities)
    .where(
      and(eq(userIdentities.userId, userId), eq(userIdentities.provider, "strava")),
    )
    .limit(1);

  const identity = rows[0];
  if (!identity || !identity.refreshToken) {
    throw new Error("No Strava identity found for user");
  }

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
  if (identity.tokenExpiresAt && identity.tokenExpiresAt > fiveMinutesFromNow) {
    return identity.accessToken!;
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env["STRAVA_CLIENT_ID"],
      client_secret: process.env["STRAVA_CLIENT_SECRET"],
      grant_type: "refresh_token",
      refresh_token: identity.refreshToken,
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${res.status}`);
  }

  const tokens = (await res.json()) as StravaTokenResponse;

  await db
    .update(userIdentities)
    .set({
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      tokenExpiresAt: new Date(tokens.expires_at * 1000),
    })
    .where(
      and(eq(userIdentities.userId, userId), eq(userIdentities.provider, "strava")),
    );

  return tokens.access_token;
}
