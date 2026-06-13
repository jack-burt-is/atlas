/**
 * Geographic data seed — v2
 *
 * Peaks:  Database of British and Irish Hills (DoBIH v18+), downloaded at
 *         seed time from hill-bagging.co.uk.  Covers all 2,400+ classified
 *         UK peaks (Munros, Corbetts, Grahams, Donalds, Wainwrights, Birketts,
 *         Nuttalls, Hewitts, Marilyns) with correct prominence and region data.
 *
 * Trails: ESRI National Trails England FeatureServer with offset=0.001 (≈110m
 *         tolerance) for smooth, accurate geometry. All 15 English national
 *         trails including Pennine Way and South West Coast Path.
 *
 * Run with: pnpm --filter @atlas/db seed:geo
 * Required env: DATABASE_URL
 */
import { Pool } from "pg";
import { execSync } from "child_process";

let pool: Pool;

// ─── helpers ──────────────────────────────────────────────────────────────────

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function wktLineString(coords: [number, number][]): string {
  return `LINESTRING(${coords.map(([lon, lat]) => `${lon} ${lat}`).join(",")})`;
}

function wktMultiLineString(paths: [number, number][][]): string {
  return `MULTILINESTRING(${paths.map(path =>
    `(${path.map(([lon, lat]) => `${lon} ${lat}`).join(",")})`
  ).join(",")})`;
}

function wktMultiPolygon(rings: [number, number][][]): string {
  const polys = rings
    .map((ring) => {
      const closed = [...ring, ring[0]!];
      return `((${closed.map(([lon, lat]) => `${lon} ${lat}`).join(",")}))`;
    })
    .join(",");
  return `MULTIPOLYGON(${polys})`;
}

// ─── DoBIH ────────────────────────────────────────────────────────────────────

interface DobihRow {
  Number: string;
  Name: string;
  "Topo Section": string;
  Classification: string;
  Metres: string;
  Drop: string;
  Latitude: string;
  Longitude: string;
  Country: string;
  // classification flag columns (value "1" when set)
  M: string;   // Munro
  C: string;   // Corbett
  G: string;   // Graham
  D: string;   // Donald
  N: string;   // Nuttall
  Hew: string; // Hewitt
  W: string;   // Wainwright
  B: string;   // Birkett
  Ma: string;  // Marilyn
  [key: string]: string;
}

// DoBIH classification column → Atlas collection slug
const DOBIH_COLLECTION_COLS: Array<{ col: string; slug: string }> = [
  { col: "M",   slug: "munros" },
  { col: "C",   slug: "corbetts" },
  { col: "G",   slug: "grahams" },
  { col: "D",   slug: "donalds" },
  { col: "N",   slug: "nuttalls" },
  { col: "Hew", slug: "hewitts" },
  { col: "W",   slug: "wainwrights" },
  { col: "B",   slug: "birketts" },
  { col: "Ma",  slug: "marilyns" },
];

const YORKSHIRE_THREE_PEAKS = new Set([
  "pen-y-ghent", "whernside", "ingleborough",
]);

const WELSH_3000ERS_MIN_M = 914;

function fetchDoBIH(): DobihRow[] {
  console.log("  → Downloading DoBIH from hill-bagging.co.uk…");
  // Uses system Python (available macOS + Linux) to handle ZIP + CSV parsing
  const json = execSync(
    `curl -s --retry 3 'https://www.hill-bagging.co.uk/dobih-downloads/hillcsv.zip' | ` +
    `python3 -c "` +
    `import csv,json,sys,io,zipfile; ` +
    `data=sys.stdin.buffer.read(); ` +
    `z=zipfile.ZipFile(io.BytesIO(data)); ` +
    `f=next(n for n in z.namelist() if n.endswith('.csv')); ` +
    `rows=list(csv.DictReader(io.TextIOWrapper(z.open(f),encoding='utf-8-sig'))); ` +
    `print(json.dumps(rows))"`,
    { encoding: "utf8", maxBuffer: 50 * 1024 * 1024 },
  );
  return JSON.parse(json) as DobihRow[];
}

// Map DoBIH "Topo Section" prefix to Atlas region name + country
function topoToAtlasRegion(topoSection: string): { region: string; country: string } {
  const ts = topoSection.toUpperCase();
  // English regions
  if (ts.startsWith("EL")) return { region: "Lake District", country: "England" };
  if (ts.startsWith("EP01") || ts.startsWith("EP02")) return { region: "North Pennines", country: "England" };
  if (ts.startsWith("EP03") || ts.startsWith("EP04")) return { region: "Yorkshire Dales", country: "England" };
  if (ts.startsWith("EP")) return { region: "Peak District", country: "England" };
  if (ts.startsWith("ES01") || ts.startsWith("ES02")) return { region: "Dartmoor", country: "England" };
  if (ts.startsWith("ES03")) return { region: "Exmoor", country: "England" };
  if (ts.startsWith("ES")) return { region: "Southern England", country: "England" };
  if (ts.startsWith("EC")) return { region: "Shropshire Hills", country: "England" };
  // Scottish regions
  if (ts.startsWith("SE")) return { region: "Cheviot Hills", country: "Scotland" };
  if (ts.startsWith("SS01") || ts.startsWith("SS02") || ts.startsWith("SS03") || ts.startsWith("SS04") || ts.startsWith("SS05")) {
    return { region: "Galloway Hills", country: "Scotland" };
  }
  if (ts.startsWith("SS")) return { region: "Southern Uplands", country: "Scotland" };
  if (ts.startsWith("SC")) return { region: "Central Scotland", country: "Scotland" };
  if (ts.startsWith("HW")) return { region: "Western Highlands", country: "Scotland" };
  if (ts.startsWith("HN")) return { region: "Northern Highlands", country: "Scotland" };
  if (ts.startsWith("HC") || ts.startsWith("HE")) return { region: "Cairngorms & Eastern Highlands", country: "Scotland" };
  if (ts.startsWith("HS")) return { region: "Southern Highlands", country: "Scotland" };
  if (ts.startsWith("HM")) return { region: "Central Highlands", country: "Scotland" };
  if (ts.startsWith("SK")) return { region: "Scottish Islands", country: "Scotland" };
  if (ts.startsWith("LH")) return { region: "Outer Hebrides", country: "Scotland" };
  // Welsh regions
  if (ts.startsWith("WN01") || ts.startsWith("WN02") || ts.startsWith("WN03") || ts.startsWith("WN04") || ts.startsWith("WN05")) {
    return { region: "Snowdonia", country: "Wales" };
  }
  if (ts.startsWith("WN")) return { region: "North Wales", country: "Wales" };
  if (ts.startsWith("WM")) return { region: "Mid Wales", country: "Wales" };
  if (ts.startsWith("WS01") || ts.startsWith("WS02") || ts.startsWith("WS03")) {
    return { region: "Brecon Beacons", country: "Wales" };
  }
  if (ts.startsWith("WS")) return { region: "Black Mountains", country: "Wales" };
  // Northern Ireland
  if (ts.startsWith("IA") || ts.startsWith("IB") || ts.startsWith("IC")) {
    return { region: "Northern Ireland", country: "Northern Ireland" };
  }
  // Isle of Man
  if (ts.startsWith("XM")) return { region: "Isle of Man", country: "Isle of Man" };
  return { region: "United Kingdom", country: "United Kingdom" };
}

function dobihCollections(row: DobihRow, regionCountry: { region: string; country: string }): string[] {
  const slugs: string[] = [];
  for (const { col, slug } of DOBIH_COLLECTION_COLS) {
    if (row[col] === "1") slugs.push(slug);
  }
  // Welsh 3000ers
  if (regionCountry.country === "Wales" && parseFloat(row.Metres || "0") >= WELSH_3000ERS_MIN_M) {
    slugs.push("welsh-3000ers");
  }
  // Yorkshire Three Peaks (by slug match)
  const peakSlug = slugify(row.Name);
  if (YORKSHIRE_THREE_PEAKS.has(peakSlug)) {
    slugs.push("yorkshire-three-peaks");
  }
  return [...new Set(slugs)];
}

// ─── ESRI National Trails ─────────────────────────────────────────────────────

function haversineM(a: [number, number], b: [number, number]): number {
  const R = 6371000, p = Math.PI / 180;
  const dLat = (b[1] - a[1]) * p;
  const dLon = (b[0] - a[0]) * p;
  const sin2 = Math.sin(dLat / 2) ** 2 + Math.cos(a[1] * p) * Math.cos(b[1] * p) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(sin2));
}

// Chain MultiLineString paths into walking order via greedy nearest-endpoint.
// ESRI returns paths in arbitrary order; naive flattening creates huge straight-line jumps.
function chainPaths(paths: [number, number][][]): [number, number][] {
  if (paths.length === 0) return [];
  if (paths.length === 1) return paths[0]!.slice();

  const remaining = paths.map(p => p.slice() as [number, number][]);
  const result: [number, number][] = remaining.splice(0, 1)[0]!;

  while (remaining.length > 0) {
    const tail = result[result.length - 1]!;
    let bestIdx = 0, bestDist = Infinity, bestReverse = false;
    for (let i = 0; i < remaining.length; i++) {
      const p = remaining[i]!;
      const dStart = haversineM(tail, p[0]!);
      const dEnd = haversineM(tail, p[p.length - 1]!);
      if (dStart < bestDist) { bestDist = dStart; bestIdx = i; bestReverse = false; }
      if (dEnd < bestDist) { bestDist = dEnd; bestIdx = i; bestReverse = true; }
    }
    const next = remaining.splice(bestIdx, 1)[0]!;
    if (bestReverse) next.reverse();
    // Skip duplicate endpoint if paths share a junction point
    const startIdx = (next[0]![0] === tail[0] && next[0]![1] === tail[1]) ? 1 : 0;
    result.push(...next.slice(startIdx));
  }

  return result;
}

async function fetchNationalTrailsEsri(): Promise<
  Map<string, { lengthKm: number; paths: [number, number][][]; coords: [number, number][] }>
> {
  console.log("  → Querying ESRI National Trails API…");
  const url = new URL(
    "https://services.arcgis.com/JJzESW51TqeY9uat/arcgis/rest/services/National_Trails_England/FeatureServer/0/query",
  );
  url.searchParams.set("where", "1=1");
  url.searchParams.set("outFields", "Name,Length_Km");
  url.searchParams.set("returnGeometry", "true");
  url.searchParams.set("outSR", "4326");
  url.searchParams.set("maxAllowableOffset", "0.001"); // ≈110m — smooth but not bloated
  url.searchParams.set("geometryPrecision", "6");
  url.searchParams.set("f", "geojson");

  const res = await fetch(url.toString(), {
    headers: { "User-Agent": "AtlasSeed/2.0 (atlas-local-dev)" },
  });
  if (!res.ok) throw new Error(`ESRI API HTTP ${res.status}`);
  const data = (await res.json()) as {
    exceededTransferLimit?: boolean;
    features: Array<{
      properties: { Name: string; Length_Km: number };
      geometry: { type: string; coordinates: number[][][] | number[][] };
    }>;
  };

  if (data.exceededTransferLimit) {
    console.warn("  ⚠ ESRI exceededTransferLimit — geometry may be truncated");
  }

  const result = new Map<string, { lengthKm: number; paths: [number, number][][]; coords: [number, number][] }>();
  for (const f of data.features) {
    const name = f.properties.Name;
    const lengthKm = f.properties.Length_Km;
    let paths: [number, number][][];
    if (f.geometry.type === "LineString") {
      paths = [(f.geometry.coordinates as number[][]).map(
        ([lon, lat]) => [lon, lat] as [number, number],
      )];
    } else {
      paths = (f.geometry.coordinates as number[][][]).map(path =>
        path.map(([lon, lat]) => [lon, lat] as [number, number]),
      );
    }
    // chainPaths puts paths in walking order for section slicing
    const coords = chainPaths(paths);
    result.set(name, { lengthKm, paths, coords });
  }
  return result;
}

function autoStages(
  trailName: string,
  coords: [number, number][],
  totalDistKm: number,
): { name: string; from: number; to: number; distKm: number }[] {
  const count = Math.min(10, Math.max(5, Math.round(totalDistKm / 35)));
  const step = Math.floor(coords.length / count);
  const distPerStage = Math.round(totalDistKm / count);
  return Array.from({ length: count }, (_, i) => ({
    name: `${trailName} Section ${i + 1}`,
    from: i * step,
    to: i === count - 1 ? coords.length - 1 : (i + 1) * step,
    distKm: distPerStage,
  }));
}

// ─── Collections ──────────────────────────────────────────────────────────────

type CollectionRow = {
  id: string;
  slug: string;
  name: string;
  type: "peaks" | "trails" | "landmarks" | "regions";
  description: string;
  region: string;
  country: string;
  sort_order: number;
};

const ALL_PEAK_COLLECTIONS: CollectionRow[] = [
  {
    id: "11111111-1111-1111-1111-111111111101",
    slug: "wainwrights",
    name: "Wainwrights",
    type: "peaks",
    description: "The 214 fells of the Lake District featured in Alfred Wainwright's Pictorial Guide to the Lakeland Fells (1955–1966).",
    region: "Lake District",
    country: "England",
    sort_order: 1,
  },
  {
    id: "11111111-1111-1111-1111-111111111102",
    slug: "munros",
    name: "Munros",
    type: "peaks",
    description: "The 282 Scottish mountains with a summit height over 3,000 feet (914 m), as classified by Sir Hugh Munro in 1891.",
    region: "Scottish Highlands",
    country: "Scotland",
    sort_order: 2,
  },
  {
    id: "11111111-1111-1111-1111-111111111107",
    slug: "yorkshire-three-peaks",
    name: "Yorkshire Three Peaks",
    type: "peaks",
    description: "The classic challenge: Pen-y-Ghent, Whernside, and Ingleborough — all three in a single day.",
    region: "Yorkshire Dales",
    country: "England",
    sort_order: 7,
  },
  {
    id: "11111111-1111-1111-1111-111111111108",
    slug: "welsh-3000ers",
    name: "Welsh 3000ers",
    type: "peaks",
    description: "The 15 peaks in Wales exceeding 3,000 feet (914 m), concentrated in the Snowdonia massif of Gwynedd.",
    region: "Snowdonia",
    country: "Wales",
    sort_order: 8,
  },
  {
    id: "11111111-1111-1111-1111-111111111121",
    slug: "corbetts",
    name: "Corbetts",
    type: "peaks",
    description: "The 222 Scottish mountains between 762 m (2,500 ft) and 914 m (3,000 ft) with a prominence of at least 152 m (500 ft), listed by John Rooke Corbett.",
    region: "Scotland",
    country: "Scotland",
    sort_order: 21,
  },
  {
    id: "11111111-1111-1111-1111-111111111122",
    slug: "grahams",
    name: "Grahams",
    type: "peaks",
    description: "The 231 Scottish mountains between 609 m (2,000 ft) and 762 m (2,500 ft) with a prominence of at least 150 m (492 ft), compiled by Fiona Torbet (née Graham).",
    region: "Scotland",
    country: "Scotland",
    sort_order: 22,
  },
  {
    id: "11111111-1111-1111-1111-111111111123",
    slug: "donalds",
    name: "Donalds",
    type: "peaks",
    description: "The 89 hills of the Scottish Lowlands south of the Highland Boundary Fault with a height of at least 610 m (2,000 ft), listed by Percy Donald.",
    region: "Southern Uplands",
    country: "Scotland",
    sort_order: 23,
  },
  {
    id: "11111111-1111-1111-1111-111111111124",
    slug: "nuttalls",
    name: "Nuttalls",
    type: "peaks",
    description: "The 442 mountains of England and Wales with a height of at least 610 m (2,000 ft) and a prominence of at least 15 m (50 ft), listed by John and Anne Nuttall.",
    region: "England & Wales",
    country: "England",
    sort_order: 24,
  },
  {
    id: "11111111-1111-1111-1111-111111111125",
    slug: "hewitts",
    name: "Hewitts",
    type: "peaks",
    description: "Hills in England, Wales and Ireland with heights of at least 2,000 feet (610 m) and a prominence of at least 30 m (98 ft).",
    region: "England & Wales",
    country: "England",
    sort_order: 25,
  },
  {
    id: "11111111-1111-1111-1111-111111111126",
    slug: "birketts",
    name: "Birketts",
    type: "peaks",
    description: "The 541 Lake District fells with a height of at least 1,000 feet (305 m) and a prominence of at least 30 m (98 ft), listed by Bill Birkett.",
    region: "Lake District",
    country: "England",
    sort_order: 26,
  },
  {
    id: "11111111-1111-1111-1111-111111111127",
    slug: "marilyns",
    name: "Marilyns",
    type: "peaks",
    description: "Hills in the British Isles with a topographic prominence of at least 150 m (492 ft), regardless of height — the UK's version of the Munro-esque prominence-based classification, coined by Alan Dawson.",
    region: "United Kingdom",
    country: "United Kingdom",
    sort_order: 27,
  },
];

const NATIONAL_TRAIL_META: Record<
  string,
  { id: string; slug: string; description: string; region: string; country: string; sortOrder: number }
> = {
  "Pennine Way": {
    id: "11111111-1111-1111-1111-111111111103",
    slug: "pennine-way",
    description: "England's first and most challenging National Trail — 268 miles from Edale in the Peak District to Kirk Yetholm in the Scottish Borders, following the spine of the Pennines.",
    region: "Northern England",
    country: "England",
    sortOrder: 3,
  },
  "South West Coast Path": {
    id: "11111111-1111-1111-1111-111111111104",
    slug: "south-west-coast-path",
    description: "England's longest National Trail at 630 miles, tracing the coastline from Minehead in Somerset to South Haven Point in Dorset via Land's End.",
    region: "South West England",
    country: "England",
    sortOrder: 4,
  },
  "Cleveland Way": {
    id: "11111111-1111-1111-1111-111111111109",
    slug: "cleveland-way",
    description: "A 171-mile National Trail circling the North York Moors from Helmsley to Filey Brigg via the Heritage Coast.",
    region: "North Yorkshire",
    country: "England",
    sortOrder: 9,
  },
  "Cotswold Way": {
    id: "11111111-1111-1111-1111-111111111110",
    slug: "cotswold-way",
    description: "A 102-mile route from Bath to Chipping Campden along the Cotswold escarpment through honey-coloured villages and ancient hill forts.",
    region: "Cotswolds",
    country: "England",
    sortOrder: 10,
  },
  "Hadrian's Wall Path": {
    id: "11111111-1111-1111-1111-111111111111",
    slug: "hadrians-wall-path",
    description: "An 84-mile National Trail from Wallsend on Tyne to Bowness-on-Solway, following the line of Hadrian's Roman Wall.",
    region: "Northern England",
    country: "England",
    sortOrder: 11,
  },
  "North Downs Way": {
    id: "11111111-1111-1111-1111-111111111112",
    slug: "north-downs-way",
    description: "A 153-mile National Trail following the chalk ridge of the North Downs from Farnham in Surrey to Dover in Kent.",
    region: "South East England",
    country: "England",
    sortOrder: 12,
  },
  "Offa's Dyke Path": {
    id: "11111111-1111-1111-1111-111111111113",
    slug: "offas-dyke-path",
    description: "A 177-mile National Trail following the ancient earthwork along the England–Wales border from Chepstow to Prestatyn.",
    region: "Welsh Borders",
    country: "England/Wales",
    sortOrder: 13,
  },
  "Peddars Way and Norfolk Coast Path": {
    id: "11111111-1111-1111-1111-111111111114",
    slug: "peddars-way-and-norfolk-coast-path",
    description: "A 93-mile National Trail from Knettishall Heath to Cromer, following a Roman road north then along the Norfolk Heritage Coast.",
    region: "Norfolk",
    country: "England",
    sortOrder: 14,
  },
  "Pennine Bridleway": {
    id: "11111111-1111-1111-1111-111111111115",
    slug: "pennine-bridleway",
    description: "A 205-mile multi-use trail for walkers, cyclists, and horse riders through the Pennines from Derbyshire to Cumbria.",
    region: "Northern England",
    country: "England",
    sortOrder: 15,
  },
  "The Ridgeway": {
    id: "11111111-1111-1111-1111-111111111116",
    slug: "the-ridgeway",
    description: "An 87-mile route along Britain's oldest road from Overton Hill near Avebury through the North Wessex Downs and Chilterns to Ivinghoe Beacon.",
    region: "South Central England",
    country: "England",
    sortOrder: 16,
  },
  "South Downs Way": {
    id: "11111111-1111-1111-1111-111111111117",
    slug: "south-downs-way",
    description: "A 100-mile National Trail following the chalk ridge of the South Downs from Winchester to Eastbourne.",
    region: "South East England",
    country: "England",
    sortOrder: 17,
  },
  "Thames Path": {
    id: "11111111-1111-1111-1111-111111111118",
    slug: "thames-path",
    description: "A 184-mile National Trail following the River Thames from its source near Kemble in the Cotswolds to the Thames Barrier in London.",
    region: "South East England",
    country: "England",
    sortOrder: 18,
  },
  "Yorkshire Wolds Way": {
    id: "11111111-1111-1111-1111-111111111119",
    slug: "yorkshire-wolds-way",
    description: "An 80-mile National Trail from Hessle on the Humber Estuary through the chalk hills of the Yorkshire Wolds to Filey Brigg.",
    region: "Yorkshire",
    country: "England",
    sortOrder: 19,
  },
  "Coast to Coast": {
    id: "11111111-1111-1111-1111-111111111120",
    slug: "coast-to-coast",
    description: "Alfred Wainwright's iconic 190-mile route from St Bees on the Cumbrian coast to Robin Hood's Bay in Yorkshire.",
    region: "Northern England",
    country: "England",
    sortOrder: 20,
  },
};

// ─── Region polygons ──────────────────────────────────────────────────────────

const LAKE_DISTRICT_RING: [number, number][] = [
  [-3.500, 54.730], [-3.210, 54.720], [-2.935, 54.690],
  [-2.760, 54.650], [-2.700, 54.520], [-2.720, 54.400],
  [-2.760, 54.310], [-2.900, 54.140], [-3.120, 54.105],
  [-3.350, 54.160], [-3.520, 54.250], [-3.630, 54.380],
  [-3.650, 54.510], [-3.600, 54.640], [-3.500, 54.730],
];

// Broad Scottish Highlands boundary (west coast to east, Stirling → Cape Wrath)
const SCOTTISH_HIGHLANDS_RING: [number, number][] = [
  [-4.000, 56.700], [-3.100, 56.700], [-2.900, 57.100],
  [-3.000, 57.500], [-3.400, 57.900], [-3.900, 58.250],
  [-4.500, 58.500], [-5.000, 58.650], [-5.500, 58.500],
  [-6.000, 58.200], [-6.200, 57.800], [-6.100, 57.200],
  [-5.700, 56.850], [-5.200, 56.700], [-4.000, 56.700],
];

// Snowdonia / Eryri National Park approximate boundary
const SNOWDONIA_RING: [number, number][] = [
  [-4.320, 53.220], [-4.050, 53.280], [-3.820, 53.290],
  [-3.680, 53.200], [-3.600, 53.090], [-3.700, 52.960],
  [-3.850, 52.870], [-4.050, 52.860], [-4.200, 52.910],
  [-4.350, 53.000], [-4.380, 53.100], [-4.320, 53.220],
];

// Brecon Beacons / Bannau Brycheiniog approximate boundary
const BRECON_BEACONS_RING: [number, number][] = [
  [-3.820, 51.980], [-3.500, 51.970], [-3.230, 51.900],
  [-3.060, 51.820], [-3.040, 51.730], [-3.200, 51.680],
  [-3.460, 51.690], [-3.700, 51.730], [-3.880, 51.820],
  [-3.900, 51.910], [-3.820, 51.980],
];

// Dartmoor National Park approximate boundary
const DARTMOOR_RING: [number, number][] = [
  [-4.150, 50.720], [-3.940, 50.730], [-3.730, 50.700],
  [-3.600, 50.620], [-3.600, 50.520], [-3.700, 50.450],
  [-3.900, 50.430], [-4.080, 50.470], [-4.200, 50.560],
  [-4.230, 50.650], [-4.150, 50.720],
];

// Southern Uplands (Scotland) approximate — from Cheviots to Galloway
const SOUTHERN_UPLANDS_RING: [number, number][] = [
  [-4.500, 55.500], [-3.800, 55.550], [-3.200, 55.520],
  [-2.700, 55.480], [-2.200, 55.350], [-2.100, 55.200],
  [-2.400, 55.100], [-3.000, 55.050], [-3.700, 55.100],
  [-4.200, 55.200], [-4.600, 55.350], [-4.500, 55.500],
];

// Galloway Hills (SW Scotland)
const GALLOWAY_HILLS_RING: [number, number][] = [
  [-5.100, 55.300], [-4.700, 55.350], [-4.300, 55.280],
  [-4.000, 55.150], [-4.000, 55.000], [-4.300, 54.900],
  [-4.700, 54.890], [-5.000, 54.980], [-5.200, 55.100],
  [-5.100, 55.300],
];

// ─── DB operations ────────────────────────────────────────────────────────────

async function upsertCollections(collections: CollectionRow[]) {
  for (const c of collections) {
    await pool.query(
      `INSERT INTO collections (id, slug, name, type, description, region, country, sort_order, item_count, created_at)
       VALUES ($1, $2, $3, $4::collection_type, $5, $6, $7, $8, 0, NOW())
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name`,
      [c.id, c.slug, c.name, c.type, c.description, c.region, c.country, c.sort_order],
    );
  }
}

async function seedRegion(
  name: string,
  slug: string,
  country: string,
  description: string,
  ring: [number, number][],
): Promise<string> {
  const geom = wktMultiPolygon([ring]);
  const res = await pool.query<{ id: string }>(
    `INSERT INTO regions (id, name, slug, country, geom, description, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3,
             ST_Multi(ST_GeomFromText($4, 4326)),
             $5, NOW())
     ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name,
           geom = EXCLUDED.geom,
           description = EXCLUDED.description
     RETURNING id`,
    [name, slug, country, geom, description],
  );
  return res.rows[0]!.id;
}

async function seedTrail(
  name: string,
  slug: string,
  country: string,
  region: string,
  distanceKm: number,
  description: string,
  paths: [number, number][][],
  allCoords: [number, number][],
  stages: { name: string; from: number; to: number; distKm: number }[],
): Promise<string> {
  const geom = wktMultiLineString(paths);
  const res = await pool.query<{ id: string }>(
    `INSERT INTO trails (id, name, slug, country, region, distance_km, elevation_gain_m, geom, section_count, description, created_at)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, NULL,
             ST_GeomFromText($6, 4326), $7, $8, NOW())
     ON CONFLICT (slug) DO UPDATE
       SET name = EXCLUDED.name,
           distance_km = EXCLUDED.distance_km,
           geom = EXCLUDED.geom
     RETURNING id`,
    [name, slug, country, region, distanceKm, geom, stages.length, description],
  );
  const trailId = res.rows[0]!.id;

  await pool.query(`DELETE FROM trail_sections WHERE trail_id = $1`, [trailId]);
  for (let i = 0; i < stages.length; i++) {
    const stage = stages[i]!;
    const sectionCoords = allCoords.slice(stage.from, stage.to + 1);
    if (sectionCoords.length < 2) continue;
    await pool.query(
      `INSERT INTO trail_sections (id, trail_id, section_number, name, distance_km, geom)
       VALUES (gen_random_uuid(), $1, $2, $3, $4, ST_GeomFromText($5, 4326))`,
      [trailId, i + 1, stage.name, stage.distKm, wktLineString(sectionCoords)],
    );
  }
  await pool.query(
    `UPDATE trails SET section_count = (SELECT count(*) FROM trail_sections WHERE trail_id = $1) WHERE id = $1`,
    [trailId],
  );
  return trailId;
}

async function seedPeaksFromDobih(
  rows: DobihRow[],
): Promise<Map<string, string[]>> {
  // Returns Map<collectionSlug, peakId[]>
  const collectionPeakIds = new Map<string, string[]>();

  const seenSlugs = new Set<string>();

  for (const row of rows) {
    const lat = parseFloat(row.Latitude);
    const lon = parseFloat(row.Longitude);
    if (!lat || !lon || !row.Name) continue;

    let slug = slugify(row.Name);
    if (seenSlugs.has(slug)) slug = `${slug}-${row.Number}`;
    seenSlugs.add(slug);

    const elevationM = Math.round(parseFloat(row.Metres) || 0);
    const prominenceM = row.Drop ? Math.round(parseFloat(row.Drop)) : null;
    const { region, country } = topoToAtlasRegion(row["Topo Section"] ?? "");
    const collections = dobihCollections(row, { region, country });
    const collectionsLiteral = `{${collections.join(",")}}`;

    const res = await pool.query<{ id: string }>(
      `INSERT INTO peaks
         (id, name, slug, elevation_m, prominence_m, latitude, longitude, geom,
          collections, country, region, tags, wiki_url, created_at)
       VALUES
         (gen_random_uuid(), $1, $2, $3, $4, $5, $6,
          ST_SetSRID(ST_MakePoint($6, $5), 4326),
          $7::text[], $8, $9, '{}'::text[], NULL, NOW())
       ON CONFLICT (slug) DO UPDATE
         SET name = EXCLUDED.name,
             elevation_m = EXCLUDED.elevation_m,
             prominence_m = EXCLUDED.prominence_m,
             geom = EXCLUDED.geom,
             collections = EXCLUDED.collections,
             region = EXCLUDED.region
       RETURNING id`,
      [row.Name, slug, elevationM, prominenceM, lat, lon, collectionsLiteral, country, region],
    );
    const id = res.rows[0]?.id;
    if (!id) continue;

    for (const colSlug of collections) {
      if (!collectionPeakIds.has(colSlug)) collectionPeakIds.set(colSlug, []);
      collectionPeakIds.get(colSlug)!.push(id);
    }
  }
  return collectionPeakIds;
}

async function linkItems(
  collectionId: string,
  itemType: "peak" | "trail" | "landmark" | "region",
  itemIds: string[],
) {
  for (let i = 0; i < itemIds.length; i++) {
    await pool.query(
      `INSERT INTO collection_items (id, collection_id, item_type, item_id, sort_order)
       VALUES (gen_random_uuid(), $1, $2::collection_item_type, $3, $4)
       ON CONFLICT (collection_id, item_type, item_id) DO NOTHING`,
      [collectionId, itemType, itemIds[i], i],
    );
  }
}

async function updateItemCount(collectionId: string) {
  await pool.query(
    `UPDATE collections SET item_count = (
       SELECT count(*) FROM collection_items WHERE collection_id = $1
     ) WHERE id = $1`,
    [collectionId],
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function run() {
  const connectionString = process.env["DATABASE_URL"];
  if (!connectionString) throw new Error("DATABASE_URL is required");
  pool = new Pool({ connectionString });

  console.log("🌍  Seeding geographic data…\n");

  // ── Collections ─────────────────────────────────────────────────────────────
  console.log("Creating collections…");
  await upsertCollections(ALL_PEAK_COLLECTIONS);
  await upsertCollections(
    Object.entries(NATIONAL_TRAIL_META).map(([name, meta]) => ({
      id: meta.id,
      slug: meta.slug,
      name,
      type: "trails" as CollectionRow["type"],
      description: meta.description,
      region: meta.region,
      country: meta.country,
      sort_order: meta.sortOrder,
    })),
  );
  // Region collections
  await upsertCollections([
    {
      id: "11111111-1111-1111-1111-111111111105",
      slug: "lake-district",
      name: "Lake District",
      type: "regions",
      description: "England's largest national park, covering 2,362 km² of Cumbria.",
      region: "Cumbria",
      country: "England",
      sort_order: 5,
    },
    {
      id: "11111111-1111-1111-1111-111111111106",
      slug: "scottish-highlands",
      name: "Scottish Highlands",
      type: "regions",
      description: "The wild upland region of northern Scotland, home to most of the country's highest peaks.",
      region: "Highlands",
      country: "Scotland",
      sort_order: 6,
    },
  ]);
  console.log("  ✓ Collections created\n");

  // ── Regions ──────────────────────────────────────────────────────────────────
  console.log("Seeding regions…");
  const regionIds: Record<string, string> = {};

  const regionDefs: [string, string, string, string, [number, number][]][] = [
    ["Lake District", "lake-district", "England", "England's largest national park in Cumbria, encompassing the central and western fells.", LAKE_DISTRICT_RING],
    ["Scottish Highlands", "scottish-highlands", "Scotland", "The mountainous region of northern Scotland, encompassing the majority of Scotland's highest peaks.", SCOTTISH_HIGHLANDS_RING],
    ["Snowdonia", "snowdonia", "Wales", "Eryri National Park in north-west Wales, home to Snowdon, the Glyders, the Carneddau, and Tryfan.", SNOWDONIA_RING],
    ["Brecon Beacons", "brecon-beacons", "Wales", "Bannau Brycheiniog National Park in south Wales, featuring Pen y Fan and the Black Mountains.", BRECON_BEACONS_RING],
    ["Dartmoor", "dartmoor", "England", "A high moorland plateau in Devon, characterised by dramatic granite tors and open moorland.", DARTMOOR_RING],
    ["Southern Uplands", "southern-uplands", "Scotland", "The rolling hills of southern Scotland stretching from the Cheviots to Galloway.", SOUTHERN_UPLANDS_RING],
    ["Galloway Hills", "galloway-hills", "Scotland", "The wild, remote hills of south-west Scotland, including the highest point of the Southern Uplands, the Merrick.", GALLOWAY_HILLS_RING],
  ];

  for (const [name, slug, country, description, ring] of regionDefs) {
    regionIds[slug] = await seedRegion(name, slug, country, description, ring);
    console.log(`  ✓ ${name}`);
  }
  console.log();

  // ── Peaks from DoBIH ─────────────────────────────────────────────────────────
  console.log("Downloading & seeding peaks from DoBIH…");
  let collectionPeakIds = new Map<string, string[]>();
  try {
    const allRows = fetchDoBIH();
    console.log(`  → DoBIH has ${allRows.length} hills`);

    const ukCodes = new Set(["E", "S", "W", "M"]); // England, Scotland, Wales, Isle of Man
    const classified = allRows.filter(
      (r) =>
        ukCodes.has(r.Country) &&
        DOBIH_COLLECTION_COLS.some(({ col }) => r[col] === "1"),
    );
    console.log(`  → ${classified.length} classified UK peaks to seed`);

    collectionPeakIds = await seedPeaksFromDobih(classified);

    // Report counts per collection
    for (const { slug } of DOBIH_COLLECTION_COLS) {
      const ids = collectionPeakIds.get(slug);
      if (ids?.length) console.log(`  ✓ ${slug}: ${ids.length} peaks`);
    }
    console.log();
  } catch (err) {
    console.warn(`  ⚠ DoBIH peak seed failed: ${err}. Continuing…\n`);
  }

  // ── National Trails from ESRI ────────────────────────────────────────────────
  console.log("Fetching National Trails from ESRI API…");
  const trailCollectionIds: Record<string, string> = {};
  try {
    const esriTrails = await fetchNationalTrailsEsri();
    console.log(`  → Received ${esriTrails.size} trails from ESRI`);

    for (const [apiName, meta] of Object.entries(NATIONAL_TRAIL_META)) {
      const trail = esriTrails.get(apiName);
      if (!trail) {
        console.warn(`  ⚠ '${apiName}' not found in ESRI response`);
        continue;
      }
      const stages = autoStages(apiName, trail.coords, trail.lengthKm);
      const trailId = await seedTrail(
        apiName,
        meta.slug,
        meta.country,
        meta.region,
        trail.lengthKm,
        meta.description,
        trail.paths,
        trail.coords,
        stages,
      );
      trailCollectionIds[meta.id] = trailId;
      console.log(`  ✓ ${apiName} (${trail.paths.length} ESRI paths, ${stages.length} sections, ${trail.coords.length} pts)`);
    }
    console.log();
  } catch (err) {
    console.warn(`  ⚠ ESRI National Trails fetch failed: ${err}. Skipping.\n`);
  }

  // ── Link collection items ────────────────────────────────────────────────────
  console.log("Linking collection items…");

  // Peak collections
  const slugToId: Record<string, string> = {
    wainwrights: "11111111-1111-1111-1111-111111111101",
    munros: "11111111-1111-1111-1111-111111111102",
    "yorkshire-three-peaks": "11111111-1111-1111-1111-111111111107",
    "welsh-3000ers": "11111111-1111-1111-1111-111111111108",
    corbetts: "11111111-1111-1111-1111-111111111121",
    grahams: "11111111-1111-1111-1111-111111111122",
    donalds: "11111111-1111-1111-1111-111111111123",
    nuttalls: "11111111-1111-1111-1111-111111111124",
    hewitts: "11111111-1111-1111-1111-111111111125",
    birketts: "11111111-1111-1111-1111-111111111126",
    marilyns: "11111111-1111-1111-1111-111111111127",
  };

  for (const [slug, collectionId] of Object.entries(slugToId)) {
    const ids = collectionPeakIds.get(slug) ?? [];
    if (ids.length > 0) {
      await linkItems(collectionId, "peak", ids);
      await updateItemCount(collectionId);
      console.log(`  ✓ ${slug} → ${ids.length} peaks`);
    }
  }

  // Trail collections
  for (const [collectionId, trailId] of Object.entries(trailCollectionIds)) {
    await linkItems(collectionId, "trail", [trailId]);
    await updateItemCount(collectionId);
  }
  console.log(`  ✓ ${Object.keys(trailCollectionIds).length} trail collections linked`);

  // Region collections
  if (regionIds["lake-district"]) {
    await linkItems("11111111-1111-1111-1111-111111111105", "region", [regionIds["lake-district"]!]);
    await updateItemCount("11111111-1111-1111-1111-111111111105");
    console.log("  ✓ Lake District collection → 1 region");
  }
  if (regionIds["scottish-highlands"]) {
    await linkItems("11111111-1111-1111-1111-111111111106", "region", [regionIds["scottish-highlands"]!]);
    await updateItemCount("11111111-1111-1111-1111-111111111106");
    console.log("  ✓ Scottish Highlands collection → 1 region");
  }

  console.log("\n✅  Geographic seed complete.");
  await pool.end();
}

import { fileURLToPath } from "url";
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run().catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
}
