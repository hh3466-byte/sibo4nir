// מסנכרן geocode ותמונות אמיתיות מ-Google Places API (New) ל-Supabase Storage (cache פעם אחת, שמירת ייחוס).
// לעולם לא מדפיס מפתחות. עובד מול Supabase test בלבד.
// שימוש: node scripts/sync-places-photos.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const root = process.cwd();
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const REF = "unhygklqxwnglzjsqrtn"; // test בלבד
const SUPABASE_URL = `https://${REF}.supabase.co`;
const GKEY = env.GOOGLE_PLACES_API_KEY;
if (!GKEY) throw new Error("חסר GOOGLE_PLACES_API_KEY ב-.env.local");
if (!env.SUPABASE_DB_PASSWORD_TEST) throw new Error("חסר SUPABASE_DB_PASSWORD_TEST");

// שליפת service_role בזיכרון בלבד (לא נכתב לקובץ ולא מודפס) לצורך יצירת bucket והעלאת תמונות ל-Storage
const rawKeys = execSync(`npx --yes supabase projects api-keys --remote=${REF} -o json`, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "ignore"],
});
const keysJson = JSON.parse(rawKeys.slice(rawKeys.indexOf("[")));
const serviceRole = keysJson.find((k) => k.id === "service_role")?.api_key;
if (!serviceRole) throw new Error("לא הצלחתי לשלוף service_role מ-Supabase CLI");

const sb = createClient(SUPABASE_URL, serviceRole, { auth: { persistSession: false } });
const BUCKET = "place-photos";

const { data: buckets } = await sb.storage.listBuckets();
if (!buckets?.some((b) => b.name === BUCKET)) {
  const { error } = await sb.storage.createBucket(BUCKET, { public: true, fileSizeLimit: 5 * 1024 * 1024 });
  if (error) throw new Error("יצירת bucket נכשלה: " + error.message);
  console.log("נוצר bucket ציבורי:", BUCKET);
} else {
  console.log("bucket קיים:", BUCKET);
}

const seed = JSON.parse(fs.readFileSync(path.join(root, "supabase", "seed", "cyclades-dev.json"), "utf8"));
const placeQueries = new Map(seed.places.map((p) => [p.id, p.query || `${p.name} Greece`]));
const tavernaQueries = new Map(seed.tavernas.map((t) => [`${t.place_id}|${t.name}`, t.query || `${t.name} Greece`]));
const hotelQueries = new Map(seed.hotels.map((h) => [`${h.place_id}|${h.name}`, h.query || `${h.name} Greece`]));

const pgClient = new pg.Client({
  host: `db.${REF}.supabase.co`,
  port: 5432,
  user: "postgres",
  password: env.SUPABASE_DB_PASSWORD_TEST,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await pgClient.connect();

async function searchPlace(textQuery) {
  const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": GKEY,
      "X-Goog-FieldMask": "places.id,places.displayName,places.location,places.photos",
    },
    body: JSON.stringify({ textQuery, maxResultCount: 1 }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.places?.[0] ?? null;
}

async function fetchAndUploadPhoto(photoObj, storagePath) {
  const url = `https://places.googleapis.com/v1/${photoObj.name}/media?maxWidthPx=1200`;
  const res = await fetch(url, { headers: { "X-Goog-Api-Key": GKEY }, redirect: "follow" });
  if (!res.ok) return null;
  const ct = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, { contentType: ct, upsert: true });
  if (error) throw new Error("העלאה ל-Storage נכשלה: " + error.message);
  const attrs = (photoObj.authorAttributions || []).map((a) => a.displayName).filter(Boolean);
  return {
    storagePath,
    attribution: attrs.length ? `Google Places · ${attrs.join(", ")}` : "Google Places",
  };
}

let stats = { placesFetched: 0, placesCached: 0, tavernasFetched: 0, hotelsFetched: 0, geocoded: 0, fallbacks: 0 };

try {
  // 1. מקומות (places)
  const places = (await pgClient.query("select id, lat, lon, approx from places where not hidden")).rows;
  const existingPhotos = new Set((await pgClient.query("select place_id from place_photos")).rows.map((r) => r.place_id));

  for (const p of places) {
    if (existingPhotos.has(p.id)) {
      stats.placesCached++;
      continue;
    }
    const q = placeQueries.get(p.id) || `${p.id} Cyclades Greece`;
    const found = await searchPlace(q);

    // לעולם לא דורסים קואורדינטות עגינה במים בקואורדינטות מרכז-עיר מ-Google Places! שומרים רק google_place_id.
    if (found?.id) {
      await pgClient.query("update places set google_place_id=$1 where id=$2", [found.id, p.id]);
    }

    const photoObj = found?.photos?.[0];
    if (photoObj) {
      const uploaded = await fetchAndUploadPhoto(photoObj, `places/${p.id}.jpg`);
      if (uploaded) {
        await pgClient.query(
          `insert into place_photos(place_id, google_place_id, storage_path, source, attribution)
           values($1,$2,$3,'google_places',$4)
           on conflict (place_id) do update set google_place_id=excluded.google_place_id, storage_path=excluded.storage_path, source=excluded.source, attribution=excluded.attribution, fetched_at=now()`,
          [p.id, found.id, uploaded.storagePath, uploaded.attribution],
        );
        stats.placesFetched++;
        continue;
      }
    }
    // נפילה לתמונת דגל מקומית
    const idx = (places.indexOf(p) % 8) + 1;
    await pgClient.query(
      `insert into place_photos(place_id, google_place_id, storage_path, source, attribution)
       values($1,$2,$3,'curated','Take Me Out') on conflict (place_id) do nothing`,
      [p.id, found?.id ?? null, `/img/e${idx}.jpg`],
    );
    stats.fallbacks++;
  }

  // 2. טברנות
  const tavernas = (await pgClient.query("select id, place_id, name, storage_path from tavernas where not hidden")).rows;
  for (const t of tavernas) {
    if (t.storage_path) continue;
    const q = tavernaQueries.get(`${t.place_id}|${t.name}`) || `${t.name} Cyclades Greece`;
    const found = await searchPlace(q);
    const photoObj = found?.photos?.[0];
    if (photoObj) {
      const uploaded = await fetchAndUploadPhoto(photoObj, `tavernas/${t.id}.jpg`);
      if (uploaded) {
        await pgClient.query(
          "update tavernas set google_place_id=$1, storage_path=$2, source='google_places', attribution=$3, fetched_at=now() where id=$4",
          [found.id, uploaded.storagePath, uploaded.attribution, t.id],
        );
        stats.tavernasFetched++;
        continue;
      }
    }
    const idx = (t.id % 8) + 1;
    await pgClient.query(
      "update tavernas set google_place_id=$1, storage_path=$2, source='curated', attribution='Take Me Out', fetched_at=now() where id=$3",
      [found?.id ?? null, `/img/e${idx}.jpg`, t.id],
    );
    stats.fallbacks++;
  }

  // 3. מלונות
  const hotels = (await pgClient.query("select id, place_id, name, storage_path from hotels where not hidden")).rows;
  for (const h of hotels) {
    if (h.storage_path) continue;
    const q = hotelQueries.get(`${h.place_id}|${h.name}`) || `${h.name} Cyclades Greece`;
    const found = await searchPlace(q);
    const photoObj = found?.photos?.[0];
    if (photoObj) {
      const uploaded = await fetchAndUploadPhoto(photoObj, `hotels/${h.id}.jpg`);
      if (uploaded) {
        await pgClient.query(
          "update hotels set google_place_id=$1, storage_path=$2, source='google_places', attribution=$3, fetched_at=now() where id=$4",
          [found.id, uploaded.storagePath, uploaded.attribution, h.id],
        );
        stats.hotelsFetched++;
        continue;
      }
    }
    const idx = (h.id % 8) + 1;
    await pgClient.query(
      "update hotels set google_place_id=$1, storage_path=$2, source='curated', attribution='Take Me Out', fetched_at=now() where id=$3",
      [found?.id ?? null, `/img/e${idx}.jpg`, h.id],
    );
    stats.fallbacks++;
  }

  console.log("סיכום סנכרון תמונות ו-geocode:", JSON.stringify(stats));
} finally {
  await pgClient.end();
}
