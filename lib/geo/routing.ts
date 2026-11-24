// ניתוב מים — נתיב שלא חוצה יבשה. לפי docs/specs/water-routing.md.
// קובץ טהור (בלי תלות ב-DOM/Next) כדי שיעבוד גם בסקריפטים ב-Node.
export type LngLat = [number, number];
export type Ring = LngLat[];
type BBox = [number, number, number, number]; // minLon, minLat, maxLon, maxLat

export type Land = { ring: Ring; bb: BBox; off: Ring };

const KX = Math.cos((37 * Math.PI) / 180); // קנה מידה אורכי ב-37°

function bboxOf(ring: Ring): BBox {
  let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
  for (const [x, y] of ring) {
    if (x < a) a = x;
    if (y < b) b = y;
    if (x > c) c = x;
    if (y > d) d = y;
  }
  return [a, b, c, d];
}

/** ray-casting: האם נקודה בתוך פוליגון (יבשה) */
export function inPoly(p: LngLat, ring: Ring): boolean {
  let inside = false;
  const [x, y] = p;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** הנקודה הקרובה ביותר על הקטע a-b */
export function nearSeg(p: LngLat, a: LngLat, b: LngLat): LngLat {
  const ax = a[0] * KX, ay = a[1], bx = b[0] * KX, by = b[1], px = p[0] * KX, py = p[1];
  const dx = bx - ax, dy = by - ay;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / l2));
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

function dist(a: LngLat, b: LngLat) {
  return Math.hypot((a[0] - b[0]) * KX, a[1] - b[1]);
}

function bbHit(a: LngLat, b: LngLat, bb: BBox) {
  return !(
    Math.max(a[0], b[0]) < bb[0] ||
    Math.min(a[0], b[0]) > bb[2] ||
    Math.max(a[1], b[1]) < bb[1] ||
    Math.min(a[1], b[1]) > bb[3]
  );
}

function orient(a: LngLat, b: LngLat, c: LngLat) {
  return (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
}

/** פרמטר t על הקטע a-b שבו הוא חותך את הקטע c-d (או null) */
function segT(a: LngLat, b: LngLat, c: LngLat, d: LngLat): number | null {
  const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
  if (o1 * o2 > 0 || o3 * o4 > 0) return null;
  const den = (b[0] - a[0]) * (d[1] - c[1]) - (b[1] - a[1]) * (d[0] - c[0]);
  if (den === 0) return null;
  const t = ((c[0] - a[0]) * (d[1] - c[1]) - (c[1] - a[1]) * (d[0] - c[0])) / den;
  return t < 0 || t > 1 ? null : t;
}

/** האם הקטע חוצה את היבשה (נקודת קצה בפנים או חיתוך עם קצה) */
export function segHitsLand(a: LngLat, b: LngLat, land: Land): boolean {
  if (!bbHit(a, b, land.bb)) return false;
  if (inPoly(a, land.ring) || inPoly(b, land.ring)) return true;
  const r = land.ring;
  for (let i = 1; i < r.length; i++) if (segT(a, b, r[i - 1], r[i]) !== null) return true;
  return false;
}

/** יוצר מבני יבשה עם קו היסט (offset) החוצה כלפי הים במרחק margin (מעלות) */
export function prepareLand(polys: Ring[], margin = 0.006): Land[] {
  return polys.map((poly) => {
    const ring = poly[0][0] === poly[poly.length - 1][0] && poly[0][1] === poly[poly.length - 1][1] ? poly : [...poly, poly[0]];
    const open = ring.slice(0, -1);
    let area = 0;
    for (let i = 0; i < open.length; i++) {
      const [x1, y1] = open[i];
      const [x2, y2] = open[(i + 1) % open.length];
      area += x1 * KX * y2 - x2 * KX * y1;
    }
    const sign = area > 0 ? 1 : -1; // CCW → החוצה הוא צד ימין
    const off: Ring = [];
    for (let i = 0; i < open.length; i++) {
      const p = open[(i - 1 + open.length) % open.length];
      const v = open[i];
      const n = open[(i + 1) % open.length];
      const e1 = [(v[0] - p[0]) * KX, v[1] - p[1]];
      const e2 = [(n[0] - v[0]) * KX, n[1] - v[1]];
      const l1 = Math.hypot(e1[0], e1[1]) || 1;
      const l2 = Math.hypot(e2[0], e2[1]) || 1;
      const n1 = [(e1[1] / l1) * sign, (-e1[0] / l1) * sign];
      const n2 = [(e2[1] / l2) * sign, (-e2[0] / l2) * sign];
      let bx = n1[0] + n2[0], by = n1[1] + n2[1];
      const bl = Math.hypot(bx, by);
      if (bl < 1e-6) { bx = n1[0]; by = n1[1]; } else { bx /= bl; by /= bl; }
      off.push([v[0] + (bx * margin) / KX, v[1] + by * margin]);
    }
    return { ring, bb: bboxOf(ring), off };
  });
}

export function onLand(p: LngLat, lands: Land[]): boolean {
  return lands.some((l) => p[0] >= l.bb[0] && p[0] <= l.bb[2] && p[1] >= l.bb[1] && p[1] <= l.bb[3] && inPoly(p, l.ring));
}

/** אם הנקודה על יבשה — דוחף אותה לקצה הקרוב + margin ימי */
export function avoid(p: LngLat, lands: Land[], margin = 0.006): LngLat {
  let cur = p;
  for (let k = 0; k < 8 && onLand(cur, lands); k++) {
    const land = lands.find((l) => inPoly(cur, l.ring))!;
    let best: LngLat = land.ring[0];
    let bd = Infinity;
    for (let i = 1; i < land.ring.length; i++) {
      const q = nearSeg(cur, land.ring[i - 1], land.ring[i]);
      const d = dist(cur, q);
      if (d < bd) { bd = d; best = q; }
    }
    const dx = (best[0] - cur[0]) * KX, dy = best[1] - cur[1];
    const l = Math.hypot(dx, dy) || 1;
    const m = margin * (1 + k * 0.5);
    cur = [best[0] + ((dx / l) * m) / KX, best[1] + (dy / l) * m];
  }
  return cur;
}

function firstBlock(a: LngLat, b: LngLat, lands: Land[]): Land | null {
  let best: Land | null = null;
  let bt = Infinity;
  for (const land of lands) {
    if (!segHitsLand(a, b, land)) continue;
    let t = 1;
    for (let i = 1; i < land.ring.length; i++) {
      const x = segT(a, b, land.ring[i - 1], land.ring[i]);
      if (x !== null && x < t) t = x;
    }
    if (t < bt) { bt = t; best = land; }
  }
  return best;
}

function nearestIdx(p: LngLat, ring: Ring) {
  let bi = 0, bd = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const d = dist(p, ring[i]);
    if (d < bd) { bd = d; bi = i; }
  }
  return bi;
}

/** עוקף את היבשה `land` בין a ל-b לאורך קו ההיסט, בכיוון הקצר */
function detour(a: LngLat, b: LngLat, land: Land, lands: Land[]): LngLat[] {
  let tmin = 1, tmax = 0;
  const r = land.ring;
  for (let i = 1; i < r.length; i++) {
    const t = segT(a, b, r[i - 1], r[i]);
    if (t !== null) { if (t < tmin) tmin = t; if (t > tmax) tmax = t; }
  }
  if (tmax < tmin) { tmin = 0; tmax = 1; }
  const pt = (t: number): LngLat => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
  const i1 = nearestIdx(pt(tmin), land.off);
  const i2 = nearestIdx(pt(tmax), land.off);
  const n = land.off.length;
  const walk = (dir: 1 | -1) => {
    const pts: LngLat[] = [land.off[i1]];
    let len = 0, i = i1;
    while (i !== i2) {
      const nx = (i + dir + n) % n;
      len += dist(land.off[i], land.off[nx]);
      pts.push(land.off[nx]);
      i = nx;
    }
    return { pts, len };
  };
  const fw = walk(1), bw = walk(-1);
  const pick = fw.len <= bw.len ? fw.pts : bw.pts;
  const safe = pick.filter((q) => !onLand(q, lands));
  return [a, ...safe, b];
}

/** string-pulling: מדלג על נקודות ביניים שאפשר לעקוף בקו ישר נקי */
function pull(path: LngLat[], lands: Land[]): LngLat[] {
  const out: LngLat[] = [path[0]];
  let i = 0;
  while (i < path.length - 1) {
    let j = path.length - 1;
    while (j > i + 1 && firstBlock(path[i], path[j], lands)) j--;
    out.push(path[j]);
    i = j;
  }
  return out;
}

/** clearLeg: מקטע a→b בלי חציית יבשה (detour + פיצול עד שכל תת-קטע נקי) */
export function clearLeg(a: LngLat, b: LngLat, lands: Land[]): LngLat[] {
  let path: LngLat[] = [a, b];
  for (let iter = 0; iter < 12; iter++) {
    let changed = false;
    const next: LngLat[] = [path[0]];
    for (let i = 1; i < path.length; i++) {
      const blk = firstBlock(path[i - 1], path[i], lands);
      if (blk) {
        next.push(...detour(path[i - 1], path[i], blk, lands).slice(1));
        changed = true;
      } else next.push(path[i]);
    }
    path = pull(next, lands);
    if (!changed) break;
  }
  return path;
}

export function densify(path: LngLat[], step = 0.004): LngLat[] {
  const out: LngLat[] = [path[0]];
  for (let i = 1; i < path.length; i++) {
    const a = path[i - 1], b = path[i];
    const n = Math.max(1, Math.ceil(dist(a, b) / step));
    for (let k = 1; k <= n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
}

export type BuiltRoute = { stops: LngLat[]; legs: LngLat[][] };

/** buildRoute: מצמיד עצירות למים, מעביר כל leg דרך clearLeg ומצפף */
export function buildRoute(stops: LngLat[], polys: Ring[], margin = 0.006): BuiltRoute {
  const lands = prepareLand(polys, margin);
  const snapped = stops.map((s) => avoid(s, lands, margin));
  const legs: LngLat[][] = [];
  for (let i = 1; i < snapped.length; i++) legs.push(densify(clearLeg(snapped[i - 1], snapped[i], lands)));
  return { stops: snapped, legs };
}

/** אימות: דגימת כל הנקודות + אמצעי הקטעים מול כל היבשות, וגם חיתוך מדויק קטע-קצה */
export function validate(legs: LngLat[][], polys: Ring[]) {
  const lands = prepareLand(polys);
  let samples = 0, inLand = 0, crossings = 0;
  for (const leg of legs) {
    for (let i = 0; i < leg.length; i++) {
      samples++;
      if (onLand(leg[i], lands)) inLand++;
      if (i > 0) {
        const mid: LngLat = [(leg[i][0] + leg[i - 1][0]) / 2, (leg[i][1] + leg[i - 1][1]) / 2];
        samples++;
        if (onLand(mid, lands)) inLand++;
        if (lands.some((l) => segHitsLand(leg[i - 1], leg[i], l))) crossings++;
      }
    }
  }
  return { samples, inLand, crossings };
}
