import fs from "node:fs";
import pg from "pg";
import { buildRoute, prepareLand, segHitsLand, onLand } from "../lib/geo/routing.ts";

const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=") && !l.startsWith("#")).map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const polys = JSON.parse(fs.readFileSync("lib/geo/coastline.json", "utf8")).polygons;
const c = new pg.Client({
  host: "db.unhygklqxwnglzjsqrtn.supabase.co",
  port: 5432,
  user: "postgres",
  password: env.SUPABASE_DB_PASSWORD_TEST,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await c.connect();
const pl = new Map((await c.query("select id,lon,lat from places")).rows.map((p) => [p.id, [p.lon, p.lat]]));
const r = (await c.query("select stops from routes where id='cyclades-heart-7d'")).rows[0];
await c.end();

const built = buildRoute(r.stops.map((id) => pl.get(id)), polys, 0.0025, r.stops);
const lands = prepareLand(polys, 0.0025);
built.legs.forEach((leg, li) => {
  for (let i = 1; i < leg.length; i++) {
    if (onLand(leg[i], lands)) console.log("onLand", li, r.stops[li], "->", r.stops[li + 1], "pt", i, leg[i]);
    lands.forEach((l, k) => {
      if (segHitsLand(leg[i - 1], leg[i], l)) console.log("hit", li, r.stops[li], "->", r.stops[li + 1], "seg", i, leg[i - 1], leg[i], "poly", k);
    });
  }
});
