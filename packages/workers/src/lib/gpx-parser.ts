export interface GpxPoint {
  lat: number;
  lon: number;
  ele?: number;
  time?: Date;
}

export interface GpxParseResult {
  name?: string;
  startedAt?: Date;
  endedAt?: Date;
  points: GpxPoint[];
  distanceM: number;
  elevationGainM: number;
  durationSeconds?: number;
}

function haversineMetres(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function parseGpx(xml: string): GpxParseResult {
  const nameMatch = /<name>([\s\S]*?)<\/name>/i.exec(xml);
  const rawName = nameMatch?.[1]?.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1").trim();
  const name = rawName || undefined;

  const points: GpxPoint[] = [];
  const trkptRegex = /<trkpt\b([^>]+)>([\s\S]*?)<\/trkpt>/g;
  let match: RegExpExecArray | null;

  while ((match = trkptRegex.exec(xml)) !== null) {
    const attrs = match[1]!;
    const inner = match[2]!;

    const latMatch = /\blat="([^"]+)"/.exec(attrs);
    const lonMatch = /\blon="([^"]+)"/.exec(attrs);
    if (!latMatch || !lonMatch) continue;

    const lat = parseFloat(latMatch[1]!);
    const lon = parseFloat(lonMatch[1]!);
    if (isNaN(lat) || isNaN(lon)) continue;

    const eleMatch = /<ele>([^<]+)<\/ele>/i.exec(inner);
    const timeMatch = /<time>([^<]+)<\/time>/i.exec(inner);

    points.push({
      lat,
      lon,
      ele: eleMatch ? parseFloat(eleMatch[1]!) : undefined,
      time: timeMatch ? new Date(timeMatch[1]!.trim()) : undefined,
    });
  }

  if (points.length < 2) {
    throw new Error(`GPX track has too few points: ${points.length}`);
  }

  let distanceM = 0;
  let elevationGainM = 0;

  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]!;
    const curr = points[i]!;
    distanceM += haversineMetres(prev.lat, prev.lon, curr.lat, curr.lon);
    if (prev.ele !== undefined && curr.ele !== undefined && curr.ele > prev.ele) {
      elevationGainM += curr.ele - prev.ele;
    }
  }

  const startedAt = points[0]?.time;
  const endedAt = points[points.length - 1]?.time;
  const durationSeconds =
    startedAt && endedAt
      ? Math.round((endedAt.getTime() - startedAt.getTime()) / 1000)
      : undefined;

  return {
    name,
    startedAt,
    endedAt,
    points,
    distanceM: Math.round(distanceM),
    elevationGainM: Math.round(elevationGainM),
    durationSeconds,
  };
}

export function buildLineStringWkt(points: GpxPoint[]): string {
  return `LINESTRING(${points.map((p) => `${p.lon} ${p.lat}`).join(", ")})`;
}
