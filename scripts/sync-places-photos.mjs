// מסנכרן עד 5 תמונות אמיתיות מ-Google Places API (New) ל-Supabase Storage (cache פעם אחת, שמירת ייחוס).
// לעולם לא מדפיס מפתחות ולא דורס קואורדינטות עגינה במים. עובד מול Supabase test בלבד.
// שימוש: node scripts/sync-places-photos.mjs
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import pg from "pg";
import { createClient } from "@supabase/supabase-js";

const MAX_PHOTOS = 5;
const CONCURRENCY = 5;

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
      "X-Goog-FieldMask": "places.id,places.displayName,places.photos",
    },
    body: JSON.stringify({ textQuery, maxResultCount: 1 }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.places?.[0] ?? null;
}

async function fetchAndUploadPhoto(photoObj, storagePath) {
  const url = `https://places.googleapis.com/v1/${photoObj.name}/media?maxWidthPx=1000`;
  const res = await fetch(url, { headers: { "X-Goog-Api-Key": GKEY }, redirect: "follow" });
  if (!res.ok) return null;
  const ct = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  const { error } = await sb.storage.from(BUCKET).upload(storagePath, buf, { contentType: ct, upsert: true });
  if (error) throw new Error("העלאה ל-Storage נכשלה: " + error.message);
  return {
    storagePath,
    authors: (photoObj.authorAttributions || []).map((a) => a.displayName).filter(Boolean),
  };
}

async function fetchMultiple(found, prefix) {
  const photoObjs = (found?.photos || []).slice(0, MAX_PHOTOS);
  const paths = [];
  const authors = new Set();
  for (let i = 0; i < photoObjs.length; i++) {
    const sp = i === 0 ? `${prefix}.jpg` : `${prefix}-${i + 1}.jpg`;
    const up = await fetchAndUploadPhoto(photoObjs[i], sp);
    if (up) {
      paths.push(up.storagePath);
      up.authors.forEach((a) => authors.add(a));
    }
  }
  const attr = authors.size ? `Google Places · ${[...authors].slice(0, 3).join(", ")}` : "Google Places";
  return { paths, attribution: attr };
}

async function runPool(items, worker) {
  let idx = 0;
  const runners = Array.from({ length: Math.min(CONCURRENCY, items.length) }, async () => {
    while (idx < items.length) {
      const cur = items[idx++];
      await worker(cur);
    }
  });
  await Promise.all(runners);
}

const stats = { placesSynced: 0, placesCached: 0, tavernasSynced: 0, tavernasCached: 0, hotelsSynced: 0, hotelsCached: 0, totalPhotos: 0, fallbacks: 0 };

try {
  // 1. מקומות (places) — רק מקומות פעילים במסלול או ב-seed
  const activeRoute = (await pgClient.query("select stops from routes where not hidden order by days desc limit 1")).rows[0];
  const activePlaceIds = new Set(activeRoute?.stops || []);
  const places = (await pgClient.query("select id from places where not hidden")).rows.filter((p) => activePlaceIds.has(p.id));
  const existingPlaceMap = new Map(
    (await pgClient.query("select place_id, photo_paths from place_photos")).rows.map((r) => [r.place_id, r.photo_paths || []]),
  );

  await runPool(places, async (p) => {
    const existing = existingPlaceMap.get(p.id) || [];
    if (existing.length >= 2) {
      stats.placesCached++;
      return;
    }
    const q = placeQueries.get(p.id) || `${p.id} Cyclades Greece`;
    const found = await searchPlace(q);
    if (found?.id) await pgClient.query("update places set google_place_id=$1 where id=$2", [found.id, p.id]);
    const { paths, attribution } = await fetchMultiple(found, `places/${p.id}`);
    if (paths.length > 0) {
      await pgClient.query(
        `insert into place_photos(place_id, google_place_id, storage_path, photo_paths, source, attribution)
         values($1,$2,$3,$4,'google_places',$5)
         on conflict (place_id) do update set google_place_id=excluded.google_place_id, storage_path=excluded.storage_path, photo_paths=excluded.photo_paths, source=excluded.source, attribution=excluded.attribution, fetched_at=now()`,
        [p.id, found.id, paths[0], paths, attribution],
      );
      stats.placesSynced++;
      stats.totalPhotos += paths.length;
    } else {
      stats.fallbacks++;
    }
  });

  // 2. טברנות
  const tavernas = (await pgClient.query("select id, place_id, name, photo_paths from tavernas where not hidden")).rows.filter((t) =>
    activePlaceIds.has(t.place_id),
  );
  await runPool(tavernas, async (t) => {
    if ((t.photo_paths || []).length >= 2) {
      stats.tavernasCached++;
      return;
    }
    const q = tavernaQueries.get(`${t.place_id}|${t.name}`) || `${t.name} Cyclades Greece`;
    const found = await searchPlace(q);
    const { paths, attribution } = await fetchMultiple(found, `tavernas/${t.id}`);
    if (paths.length > 0) {
      await pgClient.query(
        "update tavernas set google_place_id=$1, storage_path=$2, photo_paths=$3, source='google_places', attribution=$4, fetched_at=now() where id=$5",
        [found.id, paths[0], paths, attribution, t.id],
      );
      stats.tavernasSynced++;
      stats.totalPhotos += paths.length;
    } else {
      const idx = (t.id % 8) + 1;
      await pgClient.query(
        "update tavernas set storage_path=$1, photo_paths=$2, source='curated', attribution='Take Me Out', fetched_at=now() where id=$3",
        [`/img/e${idx}.jpg`, [`/img/e${idx}.jpg`], t.id],
      );
      stats.fallbacks++;
    }
  });

  // 3. מלונות
  const hotels = (await pgClient.query("select id, place_id, name, photo_paths from hotels where not hidden")).rows.filter((h) =>
    activePlaceIds.has(h.place_id),
  );
  await runPool(hotels, async (h) => {
    if ((h.photo_paths || []).length >= 2) {
      stats.hotelsCached++;
      return;
    }
    const q = hotelQueries.get(`${h.place_id}|${h.name}`) || `${h.name} Cyclades Greece`;
    const found = await searchPlace(q);
    const { paths, attribution } = await fetchMultiple(found, `hotels/${h.id}`);
    if (paths.length > 0) {
      await pgClient.query(
        "update hotels set google_place_id=$1, storage_path=$2, photo_paths=$3, source='google_places', attribution=$4, fetched_at=now() where id=$5",
        [found.id, paths[0], paths, attribution, h.id],
      );
      stats.hotelsSynced++;
      stats.totalPhotos += paths.length;
    } else {
      const idx = (h.id % 8) + 1;
      await pgClient.query(
        "update hotels set storage_path=$1, photo_paths=$2, source='curated', attribution='Take Me Out', fetched_at=now() where id=$3",
        [`/img/e${idx}.jpg`, [`/img/e${idx}.jpg`], h.id],
      );
      stats.fallbacks++;
    }
  });

  console.log("סיכום סנכרון ריבוי תמונות:", JSON.stringify(stats));
} finally {
  await pgClient.end();
}
