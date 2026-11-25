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
  islandName: string;
  type: PlaceType;
  overnight: boolean;
  lat: number;
  lon: number;
  approx: boolean;
  dwellMin: number;
  desc: string;
  photoUrl: string;
  photoUrls: string[];
  photoAttribution: string;
};

export type Taverna = {
  id: number;
  placeId: string;
  name: string;
  note: string;
  photoUrl: string;
  photoUrls: string[];
  photoAttribution: string;
};

export type AccommodationKind = "hotel" | "airbnb" | "guesthouse" | "room";

export type Hotel = {
  id: number;
  placeId: string;
  name: string;
  kind: AccommodationKind;
  priceEurCents: number;
  photoUrl: string;
  photoUrls: string[];
  photoAttribution: string;
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
  tavernas: Taverna[];
  hotels: Hotel[];
  route: FlagshipRoute;
  stopsInOrder: Place[];
  waterPath: WaterPath;
  source: "supabase" | "seed";
  pathSource: "db" | "straight-fallback";
};

type Row = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function resolvePhotoUrl(storagePath: string | null | undefined, supabaseUrl: string | undefined, fallbackIdx: number) {
  if (!storagePath) return `/img/e${(fallbackIdx % 8) + 1}.jpg`;
  if (storagePath.startsWith("/") || storagePath.startsWith("http")) return storagePath;
  if (!supabaseUrl) return `/img/e${(fallbackIdx % 8) + 1}.jpg`;
  return `${supabaseUrl}/storage/v1/object/public/place-photos/${storagePath}`;
}

function resolvePhotoUrls(
  photoPaths: string[] | null | undefined,
  storagePath: string | null | undefined,
  supabaseUrl: string | undefined,
  fallbackIdx: number,
): string[] {
  const list = Array.isArray(photoPaths) && photoPaths.length > 0 ? photoPaths : storagePath ? [storagePath] : [];
  if (list.length === 0) return [resolvePhotoUrl(null, supabaseUrl, fallbackIdx)];
  return list.map((p) => resolvePhotoUrl(p, supabaseUrl, fallbackIdx));
}

async function fromSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const sb = createClient(url, key, { auth: { persistSession: false } });
  const [places, routes, islands, tavernas, hotels, photos] = await Promise.all([
    sb.from("places").select("*"),
    sb.from("routes").select("*").order("days", { ascending: false }),
    sb.from("islands").select("*"),
    sb.from("tavernas").select("*").order("id"),
    sb.from("hotels").select("*").order("id"),
    sb.from("place_photos").select("*"),
  ]);
  for (const r of [places, routes, islands, tavernas, hotels, photos]) {
    if (r.error) throw new Error(r.error.message);
  }
  return {
    url,
    places: places.data as Row[],
    routes: routes.data as Row[],
    islands: islands.data as Row[],
    tavernas: tavernas.data as Row[],
    hotels: hotels.data as Row[],
    photos: photos.data as Row[],
  };
}

export async function getGeoData(): Promise<GeoData> {
  "use cache";
  cacheLife("minutes");

  let placeRows: Row[];
  let routeRow: Row;
  let islandRows: Row[];
  let tavernaRows: Row[];
  let hotelRows: Row[];
  let photoRows: Row[] = [];
  let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  let source: GeoData["source"] = "supabase";

  try {
    const db = await fromSupabase();
    if (!db || db.places.length === 0 || db.routes.length === 0) throw new Error("אין נתונים ב-DB");
    supabaseUrl = db.url;
    placeRows = db.places;
    routeRow = db.routes[0];
    islandRows = db.islands;
    tavernaRows = db.tavernas;
    hotelRows = db.hotels;
    photoRows = db.photos;
  } catch (e) {
    console.warn("קריאה מ-Supabase נכשלה, נפילה ל-seed:", (e as Error).message);
    source = "seed";
    islandRows = seed.islands;
    placeRows = seed.places.map((p) => ({
      id: p.id,
      name: p.name,
      island_id: p.island,
      type: p.type,
      overnight: p.overnight,
      lat: p.lat,
      lon: p.lon,
      approx: p.approx ?? true,
      dwell_min: p.dwell_min,
      description: p.desc,
    }));
    tavernaRows = seed.tavernas.map((t, i) => ({ id: i + 1, place_id: t.place_id, name: t.name, note: t.note }));
    hotelRows = seed.hotels.map((h, i) => ({
      id: i + 1,
      place_id: h.place_id,
      name: h.name,
      kind: (h as { kind?: string }).kind ?? "hotel",
      price_eur_cents: Math.round(h.price_eur * 100),
    }));
    const r = seed.flagship_routes[0];
    routeRow = {
      id: r.id,
      name: r.name,
      days: r.days,
      single_boat: r.single_boat,
      stops: r.stops,
      social_proof: r.social_proof,
      water_path: ((r as unknown) as { water_path?: WaterPath | null }).water_path ?? null,
    };
  }

  const islandNames = new Map(islandRows.map((i) => [i.id, i.name as string]));
  const photoByPlace = new Map(photoRows.map((p) => [p.place_id as string, p]));

  const places: Place[] = placeRows.map((p, idx) => {
    const ph = photoByPlace.get(p.id);
    const urls = resolvePhotoUrls(ph?.photo_paths, ph?.storage_path, supabaseUrl, idx);
    return {
      id: p.id,
      name: p.name,
      island: p.island_id,
      islandName: islandNames.get(p.island_id) ?? p.island_id,
      type: p.type,
      overnight: p.overnight,
      lat: p.lat,
      lon: p.lon,
      approx: p.approx,
      dwellMin: p.dwell_min,
      desc: p.description ?? "",
      photoUrl: urls[0],
      photoUrls: urls,
      photoAttribution: ph?.attribution ?? "",
    };
  });

  const tavernas: Taverna[] = tavernaRows.map((t, idx) => {
    const urls = resolvePhotoUrls(t.photo_paths, t.storage_path, supabaseUrl, idx + 2);
    return {
      id: t.id,
      placeId: t.place_id,
      name: t.name,
      note: t.note ?? "",
      photoUrl: urls[0],
      photoUrls: urls,
      photoAttribution: t.attribution ?? "",
    };
  });

  const hotels: Hotel[] = hotelRows.map((h, idx) => {
    const urls = resolvePhotoUrls(h.photo_paths, h.storage_path, supabaseUrl, idx + 4);
    return {
      id: h.id,
      placeId: h.place_id,
      name: h.name,
      kind: (h.kind ?? "hotel") as AccommodationKind,
      priceEurCents: h.price_eur_cents,
      photoUrl: urls[0],
      photoUrls: urls,
      photoAttribution: h.attribution ?? "",
    };
  });

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

  return { places, tavernas, hotels, route, stopsInOrder, waterPath, source, pathSource };
}
