import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife } from "next/cache";
import seed from "@/supabase/seed/cyclades-dev.json";
import type { LngLat } from "./routing";

export type PlaceType = "base" | "swim" | "snorkel" | "anchor" | "lunch" | "overnight";

export type Place = {
  id: string;
  name: string;
  island: string;
  type: PlaceType;
  overnight: boolean;
  lat: number;
  lon: number;
  approx: boolean;
  dwellMin: number;
  desc: string;
};

export type FlagshipRoute = {
  id: string;
  name: string;
  days: number;
  singleBoat: boolean;
  stops: string[];
  socialProof: string;
};

export type WaterPath = { stops: LngLat[]; legs: LngLat[][] };

export type GeoData = {
  places: Place[];
  route: FlagshipRoute;
  stopsInOrder: Place[];
  /** נתיב מים שמור (או קו ישר זמני אם לא נשמר) */
  waterPath: WaterPath;
  source: "supabase" | "seed";
  pathSource: "db" | "straight-fallback";
};

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

async function fromSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const [places, routes, islands, tavernas, hotels] = await Promise.all([
    sb.from("places").select("*"),
    sb.from("routes").select("*"),
    sb.from("islands").select("*"),
    sb.from("tavernas").select("*"),
    sb.from("hotels").select("*"),
  ]);
  for (const r of [places, routes, islands, tavernas, hotels]) if (r.error) throw new Error(r.error.message);
  return { places: places.data as Row[], routes: routes.data as Row[] };
}

export async function getGeoData(): Promise<GeoData> {
  "use cache";
  cacheLife("minutes");
  let placeRows: Row[];
  let routeRow: Row;
  let source: GeoData["source"] = "supabase";

  try {
    const db = await fromSupabase();
    if (!db || db.places.length === 0 || db.routes.length === 0) throw new Error("אין נתונים ב-DB");
    placeRows = db.places;
    routeRow = db.routes[0];
  } catch (e) {
    console.warn("קריאה מ-Supabase נכשלה, נפילה ל-seed:", (e as Error).message);
    source = "seed";
    placeRows = seed.places.map((p) => ({
      id: p.id, name: p.name, island_id: p.island, type: p.type, overnight: p.overnight,
      lat: p.lat, lon: p.lon, approx: p.approx ?? true, dwell_min: p.dwell_min, description: p.desc,
    }));
    const r = seed.flagship_routes[0];
    routeRow = { id: r.id, name: r.name, days: r.days, single_boat: r.single_boat, stops: r.stops, social_proof: r.social_proof, water_path: null };
  }

  const places: Place[] = placeRows.map((p) => ({
    id: p.id,
    name: p.name,
    island: p.island_id,
    type: p.type,
    overnight: p.overnight,
    lat: p.lat,
    lon: p.lon,
    approx: p.approx,
    dwellMin: p.dwell_min,
    desc: p.description ?? "",
  }));
  const route: FlagshipRoute = {
    id: routeRow.id,
    name: routeRow.name,
    days: routeRow.days,
    singleBoat: routeRow.single_boat,
    stops: routeRow.stops,
    socialProof: routeRow.social_proof ?? "",
  };
  const byId = new Map(places.map((p) => [p.id, p]));
  const stopsInOrder = route.stops.map((id) => {
    const p = byId.get(id);
    if (!p) throw new Error(`עצירה לא קיימת בנתונים: ${id}`);
    return p;
  });

  let waterPath: WaterPath;
  let pathSource: GeoData["pathSource"] = "db";
  const wp = routeRow.water_path as WaterPath | null;
  if (wp && wp.legs?.length === stopsInOrder.length - 1) waterPath = wp;
  else {
    pathSource = "straight-fallback";
    const pts = stopsInOrder.map((s): LngLat => [s.lon, s.lat]);
    waterPath = { stops: pts, legs: pts.slice(1).map((p, i) => [pts[i], p]) };
  }
  return { places, route, stopsInOrder, waterPath, source, pathSource };
}

