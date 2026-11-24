// מרנדר תמונת לוויין סטטית בזום גבוה (14.5) לכל עצירה במסלול הפעיל + מבט-על, לבדיקה ויזואלית של 0 חציות יבשה.
// שימוש: node scripts/verify-all-stops.mjs <outDir>
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const outDir = process.argv[2];
if (!outDir) throw new Error("חסר תיקיית פלט");
fs.mkdirSync(outDir, { recursive: true });

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const token = env.NEXT_PUBLIC_MAPBOX_TOKEN;

const c = new pg.Client({
  host: "db.unhygklqxwnglzjsqrtn.supabase.co",
  port: 5432,
  user: "postgres",
  password: env.SUPABASE_DB_PASSWORD_TEST,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const r = (await c.query("select id, stops, water_path from routes where not hidden order by days desc limit 1")).rows[0];
const places = new Map((await c.query("select id, name, lat, lon from places")).rows.map((p) => [p.id, p]));
await c.end();

const legs = r.water_path.legs;
const stopsCoords = r.water_path.stops;

const enc = (pts) => {
  let pl = "", pLat = 0, pLon = 0;
  const e = (v) => { v = v < 0 ? ~(v << 1) : v << 1; let s = ""; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } return s + String.fromCharCode(v + 63); };
  for (const [x, y] of pts) { const la = Math.round(y * 1e5), lo = Math.round(x * 1e5); pl += e(la - pLat) + e(lo - pLon); pLat = la; pLon = lo; }
  return encodeURIComponent(pl);
};

async function renderOne(file, lon, lat, zoom, includeLegs, pin) {
  const overlays = [];
  for (const leg of includeLegs) {
    const step = zoom < 10 ? 5 : 1;
    const pts = leg.filter((_, i) => i % step === 0 || i === leg.length - 1);
    if (pts.length > 1) overlays.push(`path-4+c6a35a-1(${enc(pts)})`);
  }
  if (pin) overlays.push(`pin-s+e63946(${pin[0].toFixed(5)},${pin[1].toFixed(5)})`);
  const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${overlays.join(",")}/${lon.toFixed(5)},${lat.toFixed(5)},${zoom}/700x500?access_token=${token}&logo=false&attribution=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${file} → ${res.status} ${(await res.text()).slice(0, 100)}`);
  fs.writeFileSync(path.join(outDir, file), Buffer.from(await res.arrayBuffer()));
}

// 1. מבט-על
await renderOne("00-overview.png", 24.85, 37.20, 7.6, legs, null);

// 2. כל עצירה ייחודית בזום 14.5 עם המקטע הנכנס והיוצא בלבד
const seen = new Set();
for (let i = 0; i < r.stops.length - 1; i++) {
  const id = r.stops[i];
  if (seen.has(id)) continue;
  seen.add(id);
  const p = places.get(id);
  const nearLegs = [];
  if (i > 0) nearLegs.push(legs[i - 1]);
  if (i < legs.length) nearLegs.push(legs[i]);
  if (i === 0) nearLegs.push(legs[legs.length - 1]); // חזרה לבסיס
  const [slon, slat] = stopsCoords[i];
  const moved = Math.hypot(slon - p.lon, slat - p.lat) > 0.0002;
  const zoom = id === "lavrio" || id === "naoussa" || id === "portara" ? 15 : 14;
  await renderOne(`${String(i + 1).padStart(2, "0")}-${id}.png`, slon, slat, zoom, nearLegs, [p.lon, p.lat]);
  console.log(`${String(i + 1).padStart(2, "0")} ${id}: db=(${p.lon.toFixed(4)},${p.lat.toFixed(4)}) water=(${slon.toFixed(4)},${slat.toFixed(4)})${moved ? " [הוצמד]" : ""}`);
}
console.log("סיום רינדור", seen.size + 1, "תמונות");
