// מוציא קווי חוף של הקיקלדים (Natural Earth land-10m) כפוליגוני lon/lat לניתוב בלבד.
// שימוש: node scripts/build-coastline.mjs   →  lib/geo/coastline.json
import fs from "node:fs";
import { createRequire } from "node:module";
import * as topojson from "topojson-client";

const require = createRequire(import.meta.url);
const world = require("world-atlas/land-10m.json");

// חלון אזור הפיתוח (קיקלדים מערבית-מרכזית) עם שוליים
const W = { minLon: 24.5, maxLon: 26.0, minLat: 36.6, maxLat: 37.5 };

const fc = topojson.feature(world, world.objects.land);
const features = fc.features ?? [fc];
const polys = [];

const bbox = (ring) => {
  let a = 180, b = -180, c = 90, d = -90;
  for (const [x, y] of ring) { if (x < a) a = x; if (x > b) b = x; if (y < c) c = y; if (y > d) d = y; }
  return [a, c, b, d];
};
const inWin = (bb) => bb[0] <= W.maxLon && bb[2] >= W.minLon && bb[1] <= W.maxLat && bb[3] >= W.minLat;

for (const f of features) {
  const g = f.geometry;
  const list = g.type === "Polygon" ? [g.coordinates] : g.type === "MultiPolygon" ? g.coordinates : [];
  for (const poly of list) {
    const outer = poly[0];
    if (inWin(bbox(outer))) polys.push(outer.map(([x, y]) => [+x.toFixed(5), +y.toFixed(5)]));
  }
}

fs.writeFileSync("lib/geo/coastline.json", JSON.stringify({ source: "Natural Earth land-10m (world-atlas)", window: W, polygons: polys }));
console.log("פוליגונים:", polys.length, "קודקודים:", polys.reduce((s, p) => s + p.length, 0));
