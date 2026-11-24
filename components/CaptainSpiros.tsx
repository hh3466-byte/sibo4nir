"use client";

import { useMemo, useState } from "react";
import type { Place } from "@/lib/geo";

/** קפטן ספירוס — אשף התכנון של Take Me Out.
 *  הלקוח מתאר את השאיפות (ימים, קצב, אופי), וספירוס מרכיב מסלול מותאם מהאיים הקיימים. */

type Vibe = "quiet" | "party" | "beaches" | "culture" | "food" | "family" | "nature";
type Pace = "chill" | "balanced" | "fast";

const VIBES: { id: Vibe; label: string }[] = [
  { id: "quiet", label: "שקט ורוגע" },
  { id: "beaches", label: "חופים ומים" },
  { id: "food", label: "אוכל וטברנות" },
  { id: "culture", label: "תרבות והיסטוריה" },
  { id: "nature", label: "טבע ושבילים" },
  { id: "family", label: "עם הילדים" },
  { id: "party", label: "חיי לילה" },
];

const PACES: { id: Pace; label: string; knots: number; note: string }[] = [
  { id: "chill", label: "ברוגע", knots: 15, note: "פחות מייל ביום, יותר זמן בכל מפרץ" },
  { id: "balanced", label: "מאוזן", knots: 20, note: "הקצב המומלץ — איזון בין שיט לעגינה" },
  { id: "fast", label: "רעב לדרך", knots: 26, note: "יותר איים באותם ימים, שיט ארוך יותר" },
];

// סדר גאוגרפי (כמו מסלול הדגל) + תיוג אופי ושורת ספירוס לכל אי
const ISLAND_ORDER = [
  "kea", "kythnos", "serifos", "sifnos", "syros", "paros",
  "antiparos", "naxos", "koufonisia", "schinoussa", "iraklia", "ios",
];

const ISLAND_META: Record<string, { vibes: Vibe[]; spiros: string }> = {
  kea: { vibes: ["quiet", "nature", "family"], spiros: "שכנה שקטה של אתונה — טחנות רוח ומפרצים ריקים, מושלמת ללילה ראשון." },
  kythnos: { vibes: ["quiet", "family", "nature", "food"], spiros: "מעיינות חמים ולשון החול של קולונה. אחד המפרצים היפים ביוון, סוד שמור." },
  serifos: { vibes: ["nature", "quiet", "beaches"], spiros: "פראית וכורה — חורה תלויה על צוק מעל הים, שבילי אבן ושקיעות." },
  sifnos: { vibes: ["food", "nature", "culture"], spiros: "בירת הקולינריה של יוון. כפרים לבנים, קדרות חרס ואוכל שלא תשכחו." },
  syros: { vibes: ["culture", "food"], spiros: "ארמופולי האצילית, בירת הקיקלדים — אופרה, סמטאות שיש ואווירה איטלקית." },
  paros: { vibes: ["party", "beaches", "food", "culture"], spiros: "נאוסה הקסומה ביום ובלילה. האי הכי מאוזן — לכולם יש בו משהו." },
  antiparos: { vibes: ["quiet", "beaches", "party"], spiros: "קטנה, שיקית וחופית, עם מערה מרהיבה. שקט שמתחבא ליד הבאזז של פארוס." },
  naxos: { vibes: ["culture", "beaches", "food", "family"], spiros: "שער אפולו, חופים אינסופיים והאוכל הכי טוב בקיקלדים. אי שלם בפני עצמו." },
  koufonisia: { vibes: ["quiet", "beaches", "family"], spiros: "מים קריביים בזעיר אנפין, כמעט בלי מכוניות. גן עדן למשפחות." },
  schinoussa: { vibes: ["quiet", "nature"], spiros: "הזמן עומד מלכת — מפרצים ריקים ושקט מוחלט. כאן באמת מתנתקים." },
  iraklia: { vibes: ["quiet", "nature"], spiros: "האי הכי פראי בקטנים — מערות, שבילים ולילה מתחת לכוכבים." },
  ios: { vibes: ["party", "beaches"], spiros: "בירת המסיבות הצעירה, אבל גם חופי זהב ושקיעות שמתחילות ערב שלם." },
};

function buildPlan(
  availableIslands: Set<string>,
  days: number,
  pace: Pace,
  vibes: Set<Vibe>,
) {
  const order = ISLAND_ORDER.filter((id) => availableIslands.has(id) && ISLAND_META[id]);
  const scored = order.map((id) => {
    const meta = ISLAND_META[id];
    const match = vibes.size === 0 ? 1 : meta.vibes.filter((v) => vibes.has(v)).length;
    return { id, score: match };
  });

  // כמה איים לכל יום לפי הקצב
  const perDay = pace === "chill" ? 0.55 : pace === "fast" ? 1.0 : 0.75;
  const target = Math.max(2, Math.min(order.length, Math.round(days * perDay)));

  // בחירה: עדיפות להתאמת אופי, אבל שמירה על סדר גאוגרפי
  const picked = scored
    .filter((s) => (vibes.size === 0 ? true : s.score > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, target)
    .map((s) => s.id)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));

  const islands = picked.length >= 2 ? picked : order.slice(0, Math.max(2, target));

  // פיזור האיים על פני הימים (היום האחרון = חזרה ללבריון)
  const sailingDays = Math.max(1, days - 1);
  const slots: string[] = [];
  for (let d = 0; d < sailingDays; d++) {
    const idx = Math.min(islands.length - 1, Math.floor((d * islands.length) / sailingDays));
    slots.push(islands[idx]);
  }

  const cards: { day: number; kind: "depart" | "island" | "return"; islandId?: string; extraNight?: boolean }[] = [];
  for (let d = 0; d < sailingDays; d++) {
    cards.push({
      day: d + 1,
      kind: d === 0 ? "depart" : "island",
      islandId: slots[d],
      extraNight: d > 0 && slots[d] === slots[d - 1],
    });
  }
  cards.push({ day: days, kind: "return" });
  return { cards, islands };
}

export default function CaptainSpiros({ places }: { places: Place[] }) {
  const [days, setDays] = useState(7);
  const [pace, setPace] = useState<Pace>("balanced");
  const [vibes, setVibes] = useState<Set<Vibe>>(new Set());
  const [planned, setPlanned] = useState(false);

  // מפות עזר מהנתונים: שם אי + תמונה מייצגת לכל אי
  const { islandSet, islandName, islandPhoto } = useMemo(() => {
    const set = new Set<string>();
    const nameMap = new Map<string, string>();
    const photoMap = new Map<string, string>();
    for (const p of places) {
      if (p.island === "attica") continue;
      set.add(p.island);
      if (!nameMap.has(p.island)) nameMap.set(p.island, p.islandName);
      if (!photoMap.has(p.island) && p.photoUrl) photoMap.set(p.island, p.photoUrl);
    }
    return { islandSet: set, islandName: nameMap, islandPhoto: photoMap };
  }, [places]);

  const plan = useMemo(
    () => (planned ? buildPlan(islandSet, days, pace, vibes) : null),
    [planned, islandSet, days, pace, vibes],
  );

  const paceMeta = PACES.find((p) => p.id === pace)!;

  function toggleVibe(v: Vibe) {
    setVibes((prev) => {
      const next = new Set(prev);
      if (next.has(v)) next.delete(v);
      else next.add(v);
      return next;
    });
    setPlanned(false);
  }

  const chosenVibes = VIBES.filter((v) => vibes.has(v.id)).map((v) => v.label);
  const spirosIntro = plan
    ? `${days} ימים, ${paceMeta.knots} קשר, ${chosenVibes.length ? chosenVibes.join(" ו") : "קצת מהכול"}. קיבלתי. הרכבתי לכם מסלול דרך ${plan.islands.length} איים — זה מה שהייתי עושה בעצמי.`
    : "אהוי! אני קפטן ספירוס, רב-החובל שלכם לקיקלדים. ספרו לי מה אתם מחפשים, ואני אתכנן לכם את ההפלגה המושלמת — כל השאר זה רק מלח ושמש.";

  return (
    <div className="spiros">
      <div className="spiros-head">
        <div className="spiros-avatar" aria-hidden="true">
          <svg viewBox="0 0 64 64" width="56" height="56">
            <circle cx="32" cy="32" r="31" fill="var(--ink)" stroke="var(--brass)" strokeWidth="2" />
            <path d="M20 40c0-7 5-12 12-12s12 5 12 12" fill="none" stroke="var(--brass)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="26" cy="28" r="2" fill="var(--paper)" />
            <circle cx="38" cy="28" r="2" fill="var(--paper)" />
            <path d="M14 22h36l-3-6H17z" fill="var(--brass)" />
            <path d="M24 44c3 3 13 3 16 0" fill="none" stroke="var(--paper)" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <div className="spiros-bubble">
          <span className="spiros-name">קפטן ספירוס</span>
          <p>{spirosIntro}</p>
        </div>
      </div>

      <div className="spiros-controls">
        <div className="spiros-field">
          <label className="spiros-label">כמה ימים בים?</label>
          <div className="spiros-days">
            <button type="button" className="spiros-step" onClick={() => { setDays((d) => Math.max(3, d - 1)); setPlanned(false); }} aria-label="פחות ימים">−</button>
            <span className="spiros-days-val">{days} ימים</span>
            <button type="button" className="spiros-step" onClick={() => { setDays((d) => Math.min(14, d + 1)); setPlanned(false); }} aria-label="עוד ימים">+</button>
          </div>
        </div>

        <div className="spiros-field">
          <label className="spiros-label">באיזה קצב?</label>
          <div className="spiros-paces">
            {PACES.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`spiros-pace ${pace === p.id ? "is-on" : ""}`}
                onClick={() => { setPace(p.id); setPlanned(false); }}
                title={p.note}
              >
                <strong>{p.label}</strong>
                <em>{p.knots} קשר</em>
              </button>
            ))}
          </div>
        </div>

        <div className="spiros-field">
          <label className="spiros-label">מה האווירה שאתם מחפשים?</label>
          <div className="spiros-vibes">
            {VIBES.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`spiros-vibe ${vibes.has(v.id) ? "is-on" : ""}`}
                onClick={() => toggleVibe(v.id)}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <button type="button" className="btn-brass spiros-go" onClick={() => setPlanned(true)}>
          {planned ? "תכנן לי מחדש" : "ספירוס, תכנן לי מסלול"}
        </button>
      </div>

      {plan && (
        <div className="spiros-plan">
          {plan.cards.map((c) => {
            const name = c.islandId ? islandName.get(c.islandId) ?? c.islandId : null;
            const meta = c.islandId ? ISLAND_META[c.islandId] : null;
            const photo = c.islandId ? islandPhoto.get(c.islandId) : null;
            const title =
              c.kind === "depart"
                ? `יוצאים מלבריון → ${name}`
                : c.kind === "return"
                  ? "חזרה ללבריון, אטיקה"
                  : c.extraNight
                    ? `עוד יום ב${name}`
                    : `משיטים ל${name}`;
            const line =
              c.kind === "return"
                ? "שיט אחרון חזרה לאתיקה — שמש על הפנים וראש מלא ים."
                : c.extraNight
                  ? "נשארים לילה נוסף — יש מקומות ששווה לא למהר מהם."
                  : meta?.spiros ?? "";
            return (
              <div className={`spiros-day ${c.kind === "return" ? "is-return" : ""}`} key={c.day}>
                <div className="spiros-day-num">יום {c.day}</div>
                {photo && c.kind !== "return" ? (
                  <div className="spiros-day-photo" style={{ backgroundImage: `url(${photo})` }} />
                ) : (
                  <div className="spiros-day-photo spiros-day-photo--home" aria-hidden="true" />
                )}
                <div className="spiros-day-body">
                  <strong>{title}</strong>
                  {line && <p>{line}</p>}
                </div>
              </div>
            );
          })}
          <p className="spiros-foot">
            זה קו המתאר — בשלב הביצוע נסגור יחד טברנות, לינה ועצירות שחייה בדרך. ספירוס איתכם כל הדרך.
          </p>
        </div>
      )}
    </div>
  );
}
