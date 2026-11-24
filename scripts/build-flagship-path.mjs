// בונה ושומר נתיב מים למסלולי דגל ב-Supabase test + מאמת 0 חציות יבשה.
// שימוש: node scripts/build-flagship-path.mjs   (דורש lib/geo/coastline.json מ-build-coastline.mjs)
import fs from "node:fs";
import path from "node:path";
import pg from "pg";
import { buildRoute, validate } from "../lib/geo/routing.ts";

const root = process.cwd();
const env = Object.fromEntries(
  fs.readFileSync(path.join(root, ".env.local"), "utf8").split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);
const polys = JSON.parse(fs.readFileSync("lib/geo/coastline.json", "utf8")).polygons;

const client = new pg.Client({
  host: "db.unhygklqxwnglzjsqrtn.supabase.co", // test בלבד
  port: 5432, user: "postgres", password: env.SUPABASE_DB_PASSWORD_TEST, database: "postgres",
  ssl: { rejectUnauthorized: false },
});
await client.connect();
try {
  const places = new Map((await client.query("select id,lon,lat from places")).rows.map((p) => [p.id, [p.lon, p.lat]]));
  const routes = (await client.query("select id,stops from routes")).rows;
  let totalSamples = 0, totalLand = 0, totalCross = 0;
  for (const r of routes) {
    const built = buildRoute(r.stops.map((id) => places.get(id)), polys);
    const v = validate(built.legs, polys);
    totalSamples += v.samples; totalLand += v.inLand; totalCross += v.crossings;
    console.log(`${r.id}: ${built.legs.length} מקטעים, ${built.legs.reduce((s, l) => s + l.length, 0)} נקודות | דגימות ${v.samples}, על יבשה ${v.inLand}, חציות מדויקות ${v.crossings}`);
    if (v.inLand === 0 && v.crossings === 0) {
      await client.query("update routes set water_path=$1 where id=$2", [JSON.stringify(built), r.id]);
      console.log("נשמר ב-DB");
    } else console.log("לא נשמר — יש חציות");
  }
  console.log(`סה"כ חציות יבשה: דגימות על יבשה=${totalLand}, חיתוכי קטע-קצה=${totalCross}`);
} finally {
  await client.end();
}
