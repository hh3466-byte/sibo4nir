// משלים את קו החוף של OSM בחלק המערבי בשני אריחים קטנים ומהירים ומאחד עם lib/geo/coastline.json.
// נתוני OSM תחת רישיון ODbL — © תורמי OpenStreetMap.
import fs from "node:fs";

const TILES = [
  { name: "lavrio", minLon: 24.00, maxLon: 24.16, minLat: 37.62, maxLat: 37.78 },
  { name: "kea", minLon: 24.22, maxLon: 24.42, minLat: 37.50, maxLat: 37.72 },
  { name: "kythnos", minLon: 24.34, maxLon: 24.52, minLat: 37.28, maxLat: 37.50 },
  { name: "serifos", minLon: 24.40, maxLon: 24.58, minLat: 37.08, maxLat: 37.24 },
];
const ENDPOINTS = [
  "https://overpass.private.coffee/api/interpreter",
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

async function overpass(query) {
  let last;
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "take-me-out-dev/0.1 (hagai@takemeout.co.il)",
        },
        body: "data=" + encodeURIComponent(query),
        signal: AbortSignal.timeout(60000),
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

function buildPolys(ways, W) {
  const key = (p) => p[0].toFixed(7) + "," + p[1].toFixed(7);
  const byStart = new Map();
  ways.forEach((w, i) => {
    const k = key(w[0]);
    if (!byStart.has(k)) byStart.set(k, []);
    byStart.get(k).push(i);
  });
  const used = new Set();
  const rings = [];
  const openChains = [];
  for (let i = 0; i < ways.length; i++) {
    if (used.has(i)) continue;
    used.add(i);
    const ring = [...ways[i]];
    for (;;) {
      if (key(ring[0]) === key(ring[ring.length - 1])) break;
      const nexts = (byStart.get(key(ring[ring.length - 1])) ?? []).filter((j) => !used.has(j));
      if (!nexts.length) break;
      used.add(nexts[0]);
      ring.push(...ways[nexts[0]].slice(1));
    }
    if (key(ring[0]) === key(ring[ring.length - 1]) && ring.length > 3) rings.push(ring);
    else if (ring.length > 3) openChains.push(ring);
  }
  const corners = [[W.minLon, W.minLat], [W.maxLon, W.minLat], [W.maxLon, W.maxLat], [W.minLon, W.maxLat]];
  const borderPos = (p) => {
    const dL = Math.abs(p[0] - W.minLon), dR = Math.abs(p[0] - W.maxLon);
    const dB = Math.abs(p[1] - W.minLat), dT = Math.abs(p[1] - W.maxLat);
    const m = Math.min(dL, dR, dB, dT);
    if (m === dB) return 0 + (p[0] - W.minLon) / (W.maxLon - W.minLon);
    if (m === dR) return 1 + (p[1] - W.minLat) / (W.maxLat - W.minLat);
    if (m === dT) return 2 + (W.maxLon - p[0]) / (W.maxLon - W.minLon);
    return 3 + (W.maxLat - p[1]) / (W.maxLat - W.minLat);
  };
  const closeDir = (ch, dir) => {
    const s = borderPos(ch[0]), e = borderPos(ch[ch.length - 1]);
    const closed = [...ch];
    let edge = Math.floor(e);
    const target = Math.floor(s);
    for (let step = 0; step < 4; step++) {
      if (edge === target && (step > 0 || (dir === 1 ? s > e : s < e))) break;
      const cornerIdx = dir === 1 ? (edge + 1) % 4 : edge;
      closed.push(corners[cornerIdx]);
      edge = (edge + dir + 4) % 4;
      if (edge === target) break;
    }
    closed.push(ch[0]);
    return closed;
  };
  const inRing = (pt, ring) => {
    let ins = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if (yi > pt[1] !== yj > pt[1] && pt[0] < ((xj - xi) * (pt[1] - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  };
  for (const ch of openChains) {
    // ב-OSM הים תמיד מימין לכיוון ה-way; נבחר את כיוון הסגירה שאינו מכיל את נקודת הים מימין לקטע הראשון
    const m = Math.floor(ch.length / 2);
    const a = ch[m], b = ch[Math.min(m + 1, ch.length - 1)];
    const dx = b[0] - a[0], dy = b[1] - a[1], l = Math.hypot(dx, dy) || 1;
    const seaPt = [(a[0] + b[0]) / 2 + (dy / l) * 0.002, (a[1] + b[1]) / 2 - (dx / l) * 0.002];
    const c1 = closeDir(ch, 1), c2 = closeDir(ch, -1);
    rings.push(inRing(seaPt, c1) ? c2 : c1);
  }
  return rings
    .map((r) => dp(r, 0.00002).map(([x, y]) => [+x.toFixed(6), +y.toFixed(6)]))
    .filter((r) => r.length > 3);
}

const W = { minLon: 24.00, maxLon: 24.58, minLat: 37.08, maxLat: 37.78 };
const q = `[out:json][timeout:55];(
  way["natural"="coastline"](37.62,24.00,37.78,24.16);
  way["natural"="coastline"](37.50,24.22,37.72,24.42);
  way["natural"="coastline"](37.28,24.34,37.50,24.52);
  way["natural"="coastline"](37.08,24.40,37.24,24.58);
);out geom;`;
const data = await overpass(q);
const ways = data.elements
  .filter((e) => e.type === "way" && e.geometry?.length > 1)
  .map((e) => e.geometry.map((g) => [g.lon, g.lat]));
const newPolys = buildPolys(ways, W);
console.log(`4 איים מערביים: ${ways.length} ways → ${newPolys.length} פוליגונים`);

const existing = JSON.parse(fs.readFileSync("lib/geo/coastline.json", "utf8")).polygons;
const seen = new Set();
const merged = [];
for (const p of [...existing, ...newPolys]) {
  const sig = `${p.length}:${p[0][0].toFixed(3)},${p[0][1].toFixed(3)}`;
  if (seen.has(sig)) continue;
  seen.add(sig);
  merged.push(p);
}

fs.writeFileSync(
  "lib/geo/coastline.json",
  JSON.stringify({
    source: "OpenStreetMap coastline (ODbL) via Overpass (Lavrio + Cyclades)",
    fetched: new Date().toISOString(),
    window: { minLon: 23.95, maxLon: 26.0, minLat: 36.6, maxLat: 37.82 },
    polygons: merged,
  }),
);
console.log("סה\"כ פוליגונים מאוחדים:", merged.length, "קודקודים:", merged.reduce((s, p) => s + p.length, 0));
