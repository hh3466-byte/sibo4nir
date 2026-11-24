"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import type { Place, Taverna, Hotel, WaterPath } from "@/lib/geo";
import MapSection from "@/components/MapSection";

/** קפטן ספירוס — קונסיירז' קבוע וצף של Take Me Out.
 *  נוכח לאורך כל השיחה, אפשר תמיד לדבר איתו, לתכנן ולשאול. */

type Vibe = "quiet" | "party" | "beaches" | "culture" | "food" | "family" | "nature";
type Pace = "chill" | "balanced" | "fast";
type Msg = { from: "spiros" | "user" | "mrs"; text: string };

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
  antiparos: { vibes: ["quiet", "beaches", "party"], spiros: "קטנה, שיקית וחופית, עם מערה מרהיבה. שקט ליד הבאזז של פארוס." },
  naxos: { vibes: ["culture", "beaches", "food", "family"], spiros: "שער אפולו, חופים אינסופיים והאוכל הכי טוב בקיקלדים. אי שלם בפני עצמו." },
  koufonisia: { vibes: ["quiet", "beaches", "family"], spiros: "מים קריביים בזעיר אנפין, כמעט בלי מכוניות. גן עדן למשפחות." },
  schinoussa: { vibes: ["quiet", "nature"], spiros: "הזמן עומד מלכת — מפרצים ריקים ושקט מוחלט. כאן באמת מתנתקים." },
  iraklia: { vibes: ["quiet", "nature"], spiros: "האי הכי פראי בקטנים — מערות, שבילים ולילה מתחת לכוכבים." },
  ios: { vibes: ["party", "beaches"], spiros: "בירת המסיבות הצעירה, אבל גם חופי זהב ושקיעות שמתחילות ערב שלם." },
};

function buildPlan(availableIslands: Set<string>, days: number, pace: Pace, vibes: Set<Vibe>) {
  const order = ISLAND_ORDER.filter((id) => availableIslands.has(id) && ISLAND_META[id]);
  const scored = order.map((id) => {
    const meta = ISLAND_META[id];
    const match = vibes.size === 0 ? 1 : meta.vibes.filter((v) => vibes.has(v)).length;
    return { id, score: match };
  });
  const perDay = pace === "chill" ? 0.55 : pace === "fast" ? 1.0 : 0.75;
  const target = Math.max(2, Math.min(order.length, Math.round(days * perDay)));
  const picked = scored
    .filter((s) => (vibes.size === 0 ? true : s.score > 0))
    .sort((a, b) => b.score - a.score)
    .slice(0, target)
    .map((s) => s.id)
    .sort((a, b) => order.indexOf(a) - order.indexOf(b));
  const islands = picked.length >= 2 ? picked : order.slice(0, Math.max(2, target));
  const sailingDays = Math.max(1, days - 1);
  const slots: string[] = [];
  for (let d = 0; d < sailingDays; d++) {
    slots.push(islands[Math.min(islands.length - 1, Math.floor((d * islands.length) / sailingDays))]);
  }
  const cards: { day: number; kind: "depart" | "island" | "return"; islandId?: string; extraNight?: boolean }[] = [];
  for (let d = 0; d < sailingDays; d++) {
    cards.push({ day: d + 1, kind: d === 0 ? "depart" : "island", islandId: slots[d], extraNight: d > 0 && slots[d] === slots[d - 1] });
  }
  cards.push({ day: days, kind: "return" });
  return { cards, islands };
}

/** אישורי הרקע של גברת ספירוס — כשספירוס צודק, היא מאשרת בחיבה מאחורה */
const MRS_YES = [
  "כן, כן. 👏",
  "בדיוק, מותק.",
  "נכון. הקשיבו לו.",
  "אמת — פעם אחת הוא צודק. 😘",
  "כן. סוף סוף משהו נכון, אהובי.",
  "זהו, הפעם פגעת.",
];
function mrsYes(): string {
  return MRS_YES[Math.floor(Math.random() * MRS_YES.length)];
}

/** אישור גברת ספירוס למסלול — "גם אשתו של ספירוס מסכימה" */
const MRS_APPROVE = [
  "ואני מאשרת. מסלול יפה — גם אני הייתי טסה לשם. 💙",
  "כן! תגידו בבית שאפילו אשתו של ספירוס מסכימה למסלול הזה. 😊",
  "מסלול מצוין. סמכו עליו — ועליי.",
  "אהבתי. קחו אותו בעיניים עצומות, לא תתחרטו.",
];
function mrsApprove(): string {
  return MRS_APPROVE[Math.floor(Math.random() * MRS_APPROVE.length)];
}

/** תשובות הזוג — ספירוס עונה, וגברת ספירוס מאשרת מאחורה או נותנת לו בראש ומתקנת */
function spirosReply(qRaw: string): Msg[] {
  const q = qRaw.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));
  const pair = (s: string): Msg[] => [{ from: "spiros", text: s }, { from: "mrs", text: mrsYes() }];

  // שאלות על כמה המסלול קשוח/בטיחותי/נוח → גברת ספירוס ניגשת קדימה ומרגיעה, ספירוס מגבה
  if (has("קשוח", "קשה", "מפחיד", "בטוח", "בטיחות", "סוער", "גלים", "מסוכן", "נוח", "להקיא", "בחיל", "פחד", "ים גבוה", "רגוע מספיק", "תינוק"))
    return [
      { from: "mrs", text: "רגע, אני אענה על זה — ואני הזהירה בזוג, לא מחפשת הרפתקאות. אם אני אומרת שזה בטוח ונעים, זה בטוח ונעים. המסלול רגוע: עוגנים במפרצים מוגנים, שטים בבוקר כשהים חלק, ובצהריים נחים על עוגן. פשוט משתזפים, שוחים ונהנים. אני עושה את זה כל קיץ עם כל המשפחה. 💙" },
      { from: "spiros", text: "מה שהיא אמרה. היא הראש פה, אני רק ההגה. 😊" },
    ];

  // דברים שספירוס מבלף עליהם → גברת ספירוס נותנת לו בראש ומסבירה
  if (has("מרחק", "מייל", "כמה זמן", "שעות", 'ק"מ', "קילומטר"))
    return [
      { from: "spiros", text: "מרחקים? אהh… זה בערך… לא רחוק, תאמינו לי. העיקר שמגיעים." },
      { from: "mrs", text: "*נותנת לו בראש* תתעלמו ממנו. בין רוב האיים זה 15–40 מייל ימי, שעה-שעתיים שיט ב-20 קשר. עכשיו תנווט, מותק." },
    ];
  if (has("מתי", "עונה", "חודש", "יוני", "יולי", "אוגוסט", "ספטמבר"))
    return [
      { from: "spiros", text: "העונה? כל השנה יפה פה, מה זה משנה…" },
      { from: "mrs", text: "*מגלגלת עיניים* מאי עד אוקטובר. יוני וספטמבר הכי נעימים — פחות רוח, פחות המון. רשום לך, ספירוס." },
    ];
  if (has("היסטור", "מקדש", "עתיק", "אפולו", "פורטרה", "מיתולוג"))
    return [
      { from: "spiros", text: "היסטוריה… אהh… היו פה הרבה אלים, זה בטוח." },
      { from: "mrs", text: "שער אפולו בנאקסוס הוא משקוף ממקדש מהמאה ה-6 לפנה\"ס שלא הושלם. למדת את זה כבר שלוש פעמים, אהובי." },
    ];
  if (has("דלק", "תדלוק", "ליטר", "מנוע"))
    return [
      { from: "spiros", text: "דלק? ממלאים כשנגמר. פשוט." },
      { from: "mrs", text: "יש תחנות דלק בנמלים הגדולים — פארוס, נאקסוס, סירוס. נתכנן תדלוק בדרך, אל דאגה." },
    ];

  // דברים שספירוס יודע → גברת ספירוס מאשרת מאחורה
  if (has("אחורה", "חזור", "תחזור", "קודמת", "אחורנית"))
    return pair("רוצים לחזור תחנה אחת? ברגע שנצא להפלגה על המפה — יד שלי על ההגה, נחזור בדיוק לאן שבא לכם.");
  if (has("עצור", "תעצור", "רגע", "המתן"))
    return pair("עוצרים. הים לא בורח — ניקח רגע, ונמשיך כשתגידו.");
  if (has("אוכל", "טברנה", "לאכול", "דגים", "מסעד"))
    return pair("על האוכל סומכים עליי — סמנו 'אוכל וטברנות' ואוביל אתכם לסיפנוס ולנאקסוס, הכי טעים בקיקלדים.");
  if (has("ילד", "משפח", "תינוק"))
    return pair("עם הילדים? קופוניסיה וקיתנוס — מים רדודים, מפרצים רגועים, בלי דרמות.");
  if (has("מסיב", "לילה", "בר", "כיף"))
    return pair("חיי לילה? איוס ונאוסה שבפארוס. רק תזכרו שיש הפלגה בבוקר… 😉");
  if (has("שקט", "רוג", "להתנתק", "לבד"))
    return pair("שקט אתם מחפשים? סכינוסה, איראקליה וקופוניסיה — שם הזמן פשוט עוצר.");
  if (has("מזג", "גשם", "רוח", "מלטמי", "חם", "קר"))
    return pair("קיץ בקיקלדים: שמש, מלטמי קליל אחר הצהריים, ומים של 24 מעלות. זמן מושלם לים.");
  if (has("שלום", "היי", "אהוי", "בוקר", "ערב"))
    return pair("אהוי! טוב לראות אתכם על הסיפון. ספרו לי מה בא לכם — ואני כבר רואה את המסלול.");
  return pair("ספרו לי עוד — כמה ימים, איזה קצב, ומה הראש. בחרו למעלה ואני אתכנן, או פשוט תשאלו אותי כל דבר על הקיקלדים.");
}

export default function CaptainSpiros({ places, tavernas, hotels }: { places: Place[]; tavernas: Taverna[]; hotels: Hotel[] }) {
  const [open, setOpen] = useState(false);
  const [days, setDays] = useState(7);
  const [pace, setPace] = useState<Pace>("balanced");
  const [vibes, setVibes] = useState<Set<Vibe>>(new Set());
  const [planned, setPlanned] = useState(false);
  const [launched, setLaunched] = useState(false);
  const [chat, setChat] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const plan = useMemo(() => (planned ? buildPlan(islandSet, days, pace, vibes) : null), [planned, islandSet, days, pace, vibes]);
  const paceMeta = PACES.find((p) => p.id === pace)!;

  // מסלול להרצה על המפה: נמל מייצג לכל אי + לבריון בהתחלה ובסוף, עם נתיב קו-ישר
  const spirosRoute = useMemo(() => {
    if (!plan) return null;
    const lavrio = places.find((p) => p.id === "lavrio");
    const byIsland = new Map<string, Place>();
    for (const p of places) {
      if (p.island === "attica") continue;
      const cur = byIsland.get(p.island);
      if (!cur || (p.overnight && !cur.overnight)) byIsland.set(p.island, p);
    }
    const mid = plan.islands.map((id) => byIsland.get(id)).filter((p): p is Place => !!p);
    const stops = [lavrio, ...mid, lavrio].filter((p): p is Place => !!p);
    if (stops.length < 2) return null;
    const pts = stops.map((s) => [s.lon, s.lat] as [number, number]);
    const waterPath: WaterPath = { stops: pts, legs: pts.slice(1).map((p, i) => [pts[i], p]) };
    return { stops, waterPath };
  }, [plan, places]);
  const chosenVibes = VIBES.filter((v) => vibes.has(v.id)).map((v) => v.label);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [chat, planned, open]);

  function toggleVibe(v: Vibe) {
    setVibes((prev) => { const n = new Set(prev); n.has(v) ? n.delete(v) : n.add(v); return n; });
    setPlanned(false);
  }

  function doPlan() {
    setPlanned(true);
    setLaunched(false);
    const line = `${days} ימים, ${paceMeta.knots} קשר, ${chosenVibes.length ? chosenVibes.join(" ו") : "קצת מהכול"}. קיבלתי — הרכבתי לכם מסלול, הנה הוא יום-אחר-יום.`;
    setChat((c) => [...c, { from: "spiros", text: line }, { from: "mrs", text: mrsApprove() }]);
  }

  function send() {
    const q = input.trim();
    if (!q) return;
    const reply = spirosReply(q);
    setChat((c) => [...c, { from: "user", text: q }, ...reply]);
    setInput("");
  }

  return (
    <div className={`spiros-dock ${open ? "is-open" : ""}`}>
      {!open ? (
        <button type="button" className="spiros-fab" onClick={() => setOpen(true)} aria-label="פתחו את קפטן ספירוס">
          <SpirosAvatar size={46} />
          <span className="spiros-fab-label">דברו עם<br /><strong>קפטן ספירוס</strong></span>
        </button>
      ) : (
        <div className="spiros-panel" role="dialog" aria-label="קפטן ספירוס">
          <header className="spiros-panel-head">
            <SpirosAvatar size={40} />
            <div className="spiros-panel-title">
              <strong>קפטן ספירוס</strong>
              <span>רב-החובל שלכם לקיקלדים</span>
            </div>
            <button type="button" className="spiros-panel-close" onClick={() => setOpen(false)} aria-label="מזערו">—</button>
          </header>

          <div className="spiros-thread" ref={scrollRef}>
            <Bubble from="spiros" text="אהוי! אני קפטן ספירוס. ספרו לי מה בא לכם — או פשוט שאלו אותי כל דבר על הקיקלדים." />
            <Bubble from="mrs" text="ואני גברת ספירוס. אני פה כדי לוודא שהוא לא ממציא לכם שטויות. 😄 בחרו למעלה, או שאלו — שנינו פה." />

            <div className="spiros-mini-controls">
              <div className="spiros-mini-row">
                <span className="spiros-mini-label">ימים</span>
                <button type="button" className="spiros-step" onClick={() => { setDays((d) => Math.max(3, d - 1)); setPlanned(false); }} aria-label="פחות">−</button>
                <b>{days}</b>
                <button type="button" className="spiros-step" onClick={() => { setDays((d) => Math.min(14, d + 1)); setPlanned(false); }} aria-label="עוד">+</button>
              </div>
              <div className="spiros-mini-row spiros-mini-paces">
                {PACES.map((p) => (
                  <button key={p.id} type="button" className={`spiros-pace ${pace === p.id ? "is-on" : ""}`} onClick={() => { setPace(p.id); setPlanned(false); }} title={p.note}>
                    <strong>{p.label}</strong><em>{p.knots} קשר</em>
                  </button>
                ))}
              </div>
              <div className="spiros-vibes">
                {VIBES.map((v) => (
                  <button key={v.id} type="button" className={`spiros-vibe ${vibes.has(v.id) ? "is-on" : ""}`} onClick={() => toggleVibe(v.id)}>{v.label}</button>
                ))}
              </div>
              <button type="button" className="btn-brass spiros-go" onClick={doPlan}>{planned ? "תכנן לי מחדש" : "ספירוס, תכנן לי מסלול"}</button>
            </div>

            {plan && (
              <div className="spiros-plan">
                {plan.cards.map((c) => {
                  const name = c.islandId ? islandName.get(c.islandId) ?? c.islandId : null;
                  const meta = c.islandId ? ISLAND_META[c.islandId] : null;
                  const photo = c.islandId ? islandPhoto.get(c.islandId) : null;
                  const title = c.kind === "depart" ? `יוצאים מלבריון → ${name}` : c.kind === "return" ? "חזרה ללבריון, אטיקה" : c.extraNight ? `עוד יום ב${name}` : `משיטים ל${name}`;
                  const line = c.kind === "return" ? "שיט אחרון חזרה לאתיקה — שמש על הפנים וראש מלא ים." : c.extraNight ? "נשארים לילה נוסף — יש מקומות ששווה לא למהר מהם." : meta?.spiros ?? "";
                  return (
                    <div className={`spiros-day ${c.kind === "return" ? "is-return" : ""}`} key={c.day}>
                      <div className="spiros-day-num">יום {c.day}</div>
                      <div className={`spiros-day-photo ${!photo || c.kind === "return" ? "spiros-day-photo--home" : ""}`} style={photo && c.kind !== "return" ? { backgroundImage: `url(${photo})` } : undefined} aria-hidden="true" />
                      <div className="spiros-day-body">
                        <strong>{title}</strong>
                        {line && <p>{line}</p>}
                      </div>
                    </div>
                  );
                })}
                {spirosRoute && (
                  <button type="button" className="btn-brass spiros-launch" onClick={() => setLaunched(true)}>
                    צאו להפלגה במסלול הזה →
                  </button>
                )}
              </div>
            )}

            {chat.map((m, i) => (
              <Bubble key={i} from={m.from} text={m.text} />
            ))}
          </div>

          <div className="spiros-compose">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") send(); }}
              placeholder="דברו עם ספירוס…"
              aria-label="הודעה לקפטן ספירוס"
            />
            <button type="button" onClick={send} aria-label="שליחה">➤</button>
          </div>
        </div>
      )}

      {launched && spirosRoute && (
        <div className="spiros-voyage" role="dialog" aria-label="המסלול שלכם על המפה">
          <div className="spiros-voyage-head">
            <strong>המסלול שלכם עם קפטן ספירוס</strong>
            <button type="button" className="spiros-voyage-close" onClick={() => setLaunched(false)} aria-label="סגירה">✕</button>
          </div>
          <div className="spiros-voyage-map">
            <MapSection
              places={places}
              stops={spirosRoute.stops}
              tavernas={tavernas}
              hotels={hotels}
              waterPath={spirosRoute.waterPath}
              routeName="המסלול שלכם עם ספירוס"
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SpirosAvatar({ size }: { size: number }) {
  return (
    <span className="spiros-avatar-img" style={{ width: size, height: size }} aria-hidden="true">
      <img src="/captain-spiros.jpg" alt="קפטן ספירוס" />
    </span>
  );
}

function MrsAvatar({ size }: { size: number }) {
  return (
    <span className="spiros-avatar-img" style={{ width: size, height: size }} aria-hidden="true">
      <img src="/mrs-spiros.jpg" alt="גברת ספירוס" />
    </span>
  );
}

/** בועת הודעה — עם אווטאר ושם לספירוס ולגברת ספירוס, או בועה פשוטה למשתמש */
function Bubble({ from, text }: Msg) {
  if (from === "user") return <div className="spiros-msg spiros-msg--user">{text}</div>;
  const isMrs = from === "mrs";
  return (
    <div className={`spiros-msg-row spiros-msg-row--${from}`}>
      {isMrs ? <MrsAvatar size={30} /> : <SpirosAvatar size={30} />}
      <div className={`spiros-msg spiros-msg--${from}`}>
        <span className="spiros-msg-name">{isMrs ? "גברת ספירוס" : "קפטן ספירוס"}</span>
        {text}
      </div>
    </div>
  );
}
