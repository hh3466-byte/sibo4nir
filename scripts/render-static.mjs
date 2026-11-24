// מרנדר תמונת לוויין סטטית (Mapbox Static Images) עם הנתיב (פליז) וקו החוף של OSM (אדום) לבדיקה ויזואלית.
// שימוש: node scripts/render-static.mjs <lon> <lat> <zoom> <out.png> [route|saved]
// הטוקן נקרא מ-.env.local ולא מודפס. תמונות נשמרות מחוץ ל-repo.
import fs from "node:fs";
import { buildRoute } from "../lib/geo/routing.ts";

const [lon, lat, zoom, out, mode = "route"] = process.argv.slice(2);
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const token = env.NEXT_PUBLIC_MAPBOX_TOKEN;
const polys = JSON.parse(fs.readFileSync("lib/geo/coastline.json", "utf8")).polygons;
const seed = JSON.parse(fs.readFileSync("supabase/seed/cyclades-dev.json", "utf8"));
const pl = new Map(seed.places.map((p) => [p.id, [p.lon, p.lat]]));

const enc = (pts) => {
  let pl = "", pLat = 0, pLon = 0;
  const e = (v) => { v = v < 0 ? ~(v << 1) : v << 1; let s = ""; while (v >= 0x20) { s += String.fromCharCode((0x20 | (v & 0x1f)) + 63); v >>= 5; } return s + String.fromCharCode(v + 63); };
  for (const [x, y] of pts) { const la = Math.round(y * 1e5), lo = Math.round(x * 1e5); pl += e(la - pLat) + e(lo - pLon); pLat = la; pLon = lo; }
  return encodeURIComponent(pl);
};

const z = +zoom, W = 1000, H = 700;
const scale = 360 / (512 * 2 ** z); // מעלות לפיקסל (קירוב)
const halfLon = (W / 2) * scale, halfLat = (H / 2) * scale * Math.cos((+lat * Math.PI) / 180);
const bb = [+lon - halfLon * 1.2, +lat - halfLat * 1.2, +lon + halfLon * 1.2, +lat + halfLat * 1.2];

const overlays = [];
// קו חוף OSM בתוך החלון (אדום דק) — רק בזום גבוה כדי לא לחרוג מאורך URL
if (z >= 13) {
  for (const ring of polys) {
    const inb = ring.filter(([x, y]) => x > bb[0] && x < bb[2] && y > bb[1] && y < bb[3]);
    if (inb.length < 3) continue;
    let seg = [];
    const flush = () => { if (seg.length > 1) overlays.push(`path-1+ff2a2a-0.9(${enc(seg)})`); seg = []; };
    for (const p of ring) { if (p[0] > bb[0] && p[0] < bb[2] && p[1] > bb[1] && p[1] < bb[3]) seg.push(p); else flush(); }
    flush();
  }
}
let legs;
if (mode === "saved") {
  const { default: pg } = await import("pg");
  const c = new pg.Client({ host: "db.unhygklqxwnglzjsqrtn.supabase.co", port: 5432, user: "postgres", password: env.SUPABASE_DB_PASSWORD_TEST, database: "postgres", ssl: { rejectUnauthorized: false } });
  await c.connect(); legs = (await c.query("select water_path from routes where not hidden order by days desc limit 1")).rows[0].water_path.legs; await c.end();
} else legs = buildRoute(seed.flagship_routes[0].stops.map((id) => pl.get(id)), polys).legs;
const step = z < 11 ? 3 : 1;
for (const leg of legs) {
  const pts = leg.filter(([x, y]) => x > bb[0] && x < bb[2] && y > bb[1] && y < bb[3]);
  if (pts.length > 1) overlays.push(`path-4+c6a35a-1(${enc(leg.filter((_, i) => i % step === 0 || i === leg.length - 1))})`);
}
const url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${overlays.join(",")}/${lon},${lat},${zoom}/${W}x${H}?access_token=${token}&logo=false&attribution=false`;
if (url.length > 8000) { console.log("URL ארוך מדי:", url.length, "— מקטין חלון"); process.exit(2); }
const res = await fetch(url);
if (!res.ok) { console.log("שגיאת Mapbox:", res.status, (await res.text()).slice(0, 120)); process.exit(1); }
fs.writeFileSync(out, Buffer.from(await res.arrayBuffer()));
console.log("נשמר", out, "קווים:", overlays.length, "אורך URL:", url.length);
