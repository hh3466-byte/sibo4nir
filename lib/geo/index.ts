import seed from "@/supabase/seed/cyclades-dev.json";

// שכבת נתונים גיאוגרפית. בפיתוח נקראת מקובץ ה-seed (אותו תוכן שנטען ל-Supabase test).
// RLS סגור, ולכן הקריאה מ-DB תתווסף עם policies / מפתח שרת בשלב הבא.

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

export type GeoData = {
  places: Place[];
  route: FlagshipRoute;
  /** נקודות הנתיב לפי סדר העצירות (lon, lat) */
  stopsInOrder: Place[];
};

export function getGeoData(): GeoData {
  const places: Place[] = seed.places.map((p) => ({
    id: p.id,
    name: p.name,
    island: p.island,
    type: p.type as PlaceType,
    overnight: p.overnight,
    lat: p.lat,
    lon: p.lon,
    approx: p.approx ?? true,
    dwellMin: p.dwell_min,
    desc: p.desc,
  }));
  const r = seed.flagship_routes[0];
  const route: FlagshipRoute = {
    id: r.id,
    name: r.name,
    days: r.days,
    singleBoat: r.single_boat,
    stops: r.stops,
    socialProof: r.social_proof,
  };
  const byId = new Map(places.map((p) => [p.id, p]));
  const stopsInOrder = route.stops.map((id) => {
    const p = byId.get(id);
    if (!p) throw new Error(`עצירה לא קיימת בנתונים: ${id}`);
    return p;
  });
  return { places, route, stopsInOrder };
}
