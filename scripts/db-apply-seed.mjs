// מריץ מיגרציות וטוען seed ל-Supabase. יעד נבחר כארגומנט: test (ברירת מחדל) או prod.
// שימוש: node scripts/db-apply-seed.mjs            (test)
//        node scripts/db-apply-seed.mjs prod       (prod)
// הסיסמאות נקראות מ-.env.local ולא מודפסות.
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const root = process.cwd();
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env.local"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l && !l.startsWith("#") && l.includes("="))
    .map((l) => [l.slice(0, l.indexOf("=")), l.slice(l.indexOf("=") + 1)]),
);

const TARGET = (process.argv[2] || "test").toLowerCase();
const TARGETS = {
  test: { ref: "unhygklqxwnglzjsqrtn", pw: env.SUPABASE_DB_PASSWORD_TEST },
  prod: { ref: "alymjydmogcxuzjzbsez", pw: env.SUPABASE_DB_PASSWORD_PROD },
};
if (!TARGETS[TARGET]) throw new Error(`יעד לא חוקי: ${TARGET} (test|prod)`);
const { ref: REF, pw: password } = TARGETS[TARGET];
if (!password) throw new Error(`חסרה סיסמה ל-${TARGET}`);
console.log(`יעד: ${TARGET} (${REF})`);

const client = new pg.Client({
  host: `db.${REF}.supabase.co`,
  port: 5432,
  user: "postgres",
  password,
  database: "postgres",
  ssl: { rejectUnauthorized: false },
});

await client.connect();
try {
  await client.query("begin");
  const dir = path.join(root, "supabase", "migrations");
  for (const f of fs.readdirSync(dir).sort()) {
    await client.query(fs.readFileSync(path.join(dir, f), "utf8"));
    console.log("מיגרציה הורצה:", f);
  }

  const seed = JSON.parse(fs.readFileSync(path.join(root, "supabase", "seed", "cyclades-dev.json"), "utf8"));
  for (const i of seed.islands)
    await client.query(
      "insert into islands(id,name,name_en) values($1,$2,$3) on conflict (id) do update set name=excluded.name, name_en=excluded.name_en",
      [i.id, i.name, i.name_en],
    );
  for (const a of seed.activities)
    await client.query(
      "insert into activities(type,label,default_dwell_min) values($1,$2,$3) on conflict (type) do update set label=excluded.label, default_dwell_min=excluded.default_dwell_min",
      [a.type, a.label, a.default_dwell_min],
    );
  for (const p of seed.places)
    await client.query(
      `insert into places(id,island_id,name,type,overnight,lat,lon,approx,dwell_min,description)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       on conflict (id) do update set island_id=excluded.island_id,name=excluded.name,type=excluded.type,overnight=excluded.overnight,
       lat=excluded.lat,lon=excluded.lon,approx=excluded.approx,dwell_min=excluded.dwell_min,description=excluded.description`,
      [p.id, p.island, p.name, p.type, p.overnight, p.lat, p.lon, p.approx ?? true, p.dwell_min, p.desc],
    );
  for (const t of seed.tavernas)
    await client.query(
      "insert into tavernas(place_id,name,note) values($1,$2,$3) on conflict (place_id,name) do update set note=excluded.note",
      [t.place_id, t.name, t.note],
    );
  for (const h of seed.hotels)
    await client.query(
      "insert into hotels(place_id,name,price_eur_cents,kind) values($1,$2,$3,$4) on conflict (place_id,name) do update set price_eur_cents=excluded.price_eur_cents, kind=excluded.kind",
      [h.place_id, h.name, Math.round(h.price_eur * 100), h.kind || "hotel"],
    );
  for (const r of seed.flagship_routes)
    await client.query(
      `insert into routes(id,name,days,single_boat,base_place_id,stops,social_proof,note,water_path)
       values($1,$2,$3,$4,$5,$6,$7,$8,$9)
       on conflict (id) do update set name=excluded.name,days=excluded.days,single_boat=excluded.single_boat,
       base_place_id=excluded.base_place_id,stops=excluded.stops,social_proof=excluded.social_proof,note=excluded.note,
       water_path=excluded.water_path`,
      [r.id, r.name, r.days, r.single_boat, r.base, r.stops, r.social_proof, r.note, r.water_path ? JSON.stringify(r.water_path) : null],
    );
  await client.query("commit");

  for (const t of ["islands", "places", "tavernas", "hotels", "routes", "activities"]) {
    const n = (await client.query(`select count(*)::int c from ${t}`)).rows[0].c;
    const rls = (await client.query("select relrowsecurity r from pg_class where oid=$1::regclass", [`public.${t}`])).rows[0].r;
    console.log(`${t}: ${n} שורות, RLS=${rls}`);
  }
  const wp = (await client.query("select count(*)::int c from routes where water_path is not null")).rows[0].c;
  console.log(`routes עם water_path: ${wp}`);
} catch (e) {
  await client.query("rollback").catch(() => {});
  console.error("נכשל:", e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
