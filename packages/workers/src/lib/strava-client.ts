export interface StravaActivitySummary {
  id: number;
  name: string;
  start_date: string;
  elapsed_time: number;
  distance: number;
  total_elevation_gain: number;
  type: string;
}

export interface StravaStream {
  type: string;
  data: unknown[];
}

export interface StravaTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

const BASE = "https://www.strava.com/api/v3";

async function apiFetch<T>(path: string, accessToken: string): Promise<T> {
  let delay = 1000;
  for (let attempt = 0; attempt < 5; attempt++) {
    const res = await fetch(`${BASE}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (res.status === 429) {
      await sleep(delay + Math.random() * 500);
      delay = Math.min(delay * 2, 60_000);
      continue;
    }

    if (!res.ok) {
      throw new StravaApiError(res.status, await res.text(), path);
    }

    return res.json() as Promise<T>;
  }
  throw new StravaApiError(429, "Rate limit exceeded after retries", path);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class StravaApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly path: string,
  ) {
    super(`Strava API ${status} on ${path}: ${message}`);
    this.name = "StravaApiError";
  }
}

export async function getActivities(
  accessToken: string,
  page: number,
): Promise<StravaActivitySummary[]> {
  return apiFetch<StravaActivitySummary[]>(
    `/athlete/activities?per_page=200&page=${page}`,
    accessToken,
  );
}

export async function getActivityStreams(
  accessToken: string,
  activityId: number,
): Promise<[number, number][] | null> {
  let streams: StravaStream[];
  try {
    streams = await apiFetch<StravaStream[]>(
      `/activities/${activityId}/streams?keys=latlng&key_by_type=false`,
      accessToken,
    );
  } catch (err) {
    if (err instanceof StravaApiError && err.status === 404) return null;
    throw err;
  }

  const latlngStream = streams.find((s) => s.type === "latlng");
  if (!latlngStream) return null;

  const data = latlngStream.data as [number, number][];
  if (!Array.isArray(data) || data.length < 2) return null;

  return data;
}

export async function refreshStravaToken(
  refreshToken: string,
): Promise<StravaTokenResponse> {
  const clientId = process.env["STRAVA_CLIENT_ID"];
  const clientSecret = process.env["STRAVA_CLIENT_SECRET"];
  if (!clientId || !clientSecret) {
    throw new Error("STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET not set");
  }

  const res = await fetch("https://www.strava.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) {
    throw new Error(`Strava token refresh failed: ${await res.text()}`);
  }

  return res.json() as Promise<StravaTokenResponse>;
}

export async function deauthorizeStrava(accessToken: string): Promise<void> {
  await fetch("https://www.strava.com/oauth/deauthorize", {
    method: "POST",
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

/** Convert [[lat, lng], ...] → WKT LineString, or null if fewer than 2 points. */
export function latlngToLineStringWkt(latlng: [number, number][]): string | null {
  if (latlng.length < 2) return null;
  const coords = latlng.map(([lat, lng]) => `${lng} ${lat}`).join(", ");
  return `LINESTRING(${coords})`;
}
