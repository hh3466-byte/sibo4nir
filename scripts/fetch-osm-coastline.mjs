// מוריד קו חוף ברזולוציה גבוהה מ-OpenStreetMap (Overpass) לאזור הפיתוח ובונה פוליגוני יבשה סגורים.
// נתוני OSM תחת רישיון ODbL — © תורמי OpenStreetMap (ייחוס נדרש).
// שימוש: node scripts/fetch-osm-coastline.mjs   →  lib/geo/coastline.json
import fs from "node:fs";

const W = { minLon: 24.5, maxLon: 26.0, minLat: 36.6, maxLat: 37.5 };
const ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];
const q = `[out:json][timeout:240];way["natural"="coastline"](${W.minLat},${W.minLon},${W.maxLat},${W.maxLon});out geom;`;

async function overpass(query) {
  let last;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "take-me-out-dev/0.1 (hagai@takemeout.co.il)" },
        body: "data=" + encodeURIComponent(query),
      });
      if (!res.ok) throw new Error(url + " → " + res.status);
      return await res.json();
    } catch (e) {
      last = e;
      console.warn("נכשל:", e.message);
    }
  }
  throw last;
}

const data = await overpass(q);
const ways = data.elements.filter((e) => e.type === "way" && e.geometry?.length > 1).map((e) => e.geometry.map((g) => [g.lon, g.lat]));
console.log("כיווני חוף (ways):", ways.length);

const key = (p) => p[0].toFixed(7) + "," + p[1].toFixed(7);
const byStart = new Map();
ways.forEach((w, i) => {
  const k = key(w[0]);
  if (!byStart.has(k)) byStart.set(k, []);
  byStart.get(k).push(i);
});
const used = new Set();
const rings = [];
let open = 0;
for (let i = 0; i < ways.length; i++) {
  if (used.has(i)) continue;
  used.add(i);
  let ring = [...ways[i]];
  for (;;) {
    if (key(ring[0]) === key(ring[ring.length - 1])) break;
    const nexts = (byStart.get(key(ring[ring.length - 1])) ?? []).filter((j) => !used.has(j));
    if (!nexts.length) break;
    used.add(nexts[0]);
    ring.push(...ways[nexts[0]].slice(1));
  }
  if (key(ring[0]) === key(ring[ring.length - 1]) && ring.length > 3) rings.push(ring);
  else open++;
}
console.log("טבעות סגורות:", rings.length, "שרשראות פתוחות (מתעלמים):", open);

// פישוט Douglas-Peucker עדין (~2 מ') כדי להקטין את הקובץ בלי לאבד ערוצים צרים
function dp(pts, eps) {
  if (pts.length < 3) return pts;
  const keep = new Uint8Array(pts.length);
  keep[0] = keep[pts.length - 1] = 1;
  const stack = [[0, pts.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop();
    let md = 0, mi = -1;
    const [ax, ay] = pts[a], [bx, by] = pts[b];
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    for (let i = a + 1; i < b; i++) {
      const [px, py] = pts[i];
      const t = l2 ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2)) : 0;
      const d = Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
      if (d > md) { md = d; mi = i; }
    }
    if (md > eps) { keep[mi] = 1; stack.push([a, mi], [mi, b]); }
  }
  return pts.filter((_, i) => keep[i]);
}
const polys = rings
  .map((r) => dp(r, 0.00002).map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)]))
  .filter((r) => r.length > 3);

fs.writeFileSync(
  "lib/geo/coastline.json",
  JSON.stringify({ source: "OpenStreetMap coastline (ODbL) via Overpass", fetched: new Date().toISOString(), window: W, polygons: polys }),
);
console.log("פוליגונים:", polys.length, "קודקודים:", polys.reduce((s, p) => s + p.length, 0));
