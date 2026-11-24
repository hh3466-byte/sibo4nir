"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Hotel, Place, Taverna, WaterPath } from "@/lib/geo";
import { pathLengthNm, type LngLat } from "@/lib/geo/routing";

/** מצבי מפה: planning (ברירת מחדל — קו מקווקו בפליז), live (עתידי — הפלגה בפועל על GPS בצבע שונה) */
export type MapMode = "planning" | "live";

const MODE_STYLE: Record<
  MapMode,
  { color: string; activeColor: string; dasharray?: number[] }
> = {
  planning: { color: "#c6a35a", activeColor: "#e8ce89", dasharray: [2.2, 1.5] },
  live: { color: "#2d6e73", activeColor: "#4da3a9" },
};

const TYPE_LABEL: Record<string, string> = {
  base: "מרינת יציאה",
  swim: "מפרץ לשחייה",
  snorkel: "שנירקול",
  anchor: "עוגן וצילום",
  lunch: "צהריים על המים",
  overnight: "לינה על קו המים",
};

const CRUISE_KNOTS = 20;
const START_HOUR = 9; // יציאה יום 1 בשעה 09:00

type Props = {
  places: Place[];
  stops: Place[];
  tavernas: Taverna[];
  hotels: Hotel[];
  waterPath: WaterPath;
  routeName: string;
  mode?: MapMode;
  /** שמור לעתיד: מיקום GPS חי במצב הפלגה בפועל */
  livePosition?: LngLat;
};

type ClockState = {
  day: number;
  hour: number;
  minute: number;
  elapsedHours: number;
};

type ActiveStop = {
  place: Place;
  coord: LngLat;
  index: number;
  isFirst: boolean;
  isLast: boolean;
  nextStopName?: string;
};

type AnchorPos = {
  markerX: number;
  markerY: number;
  cardLeft: number;
  cardTop: number;
  originX: number;
  originY: number;
  isMobile: boolean;
};

type DetailView =
  | { kind: "taverna"; item: Taverna }
  | { kind: "hotel"; item: Hotel }
  | null;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hoursToClock(totalTripHours: number): ClockState {
  const day = Math.floor(totalTripHours / 24) + 1;
  const rem = totalTripHours % 24;
  const hour = Math.floor(rem);
  const minute = Math.floor((rem - hour) * 60);
  return { day, hour, minute, elapsedHours: Math.max(0, totalTripHours - START_HOUR) };
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function computeAnchor(map: mapboxgl.Map, coord: LngLat): AnchorPos {
  const el = map.getContainer();
  const W = el.clientWidth || 800;
  const H = el.clientHeight || 600;
  const pt = map.project(coord);
  const isMobile = W < 640;

  const cardW = isMobile ? W - 24 : Math.min(390, W - 40);
  const cardH = isMobile ? Math.min(440, H * 0.68) : Math.min(480, H - 110);

  if (isMobile) {
    const cardLeft = 12;
    const cardTop = Math.max(74, H - cardH - 12);
    return {
      markerX: pt.x,
      markerY: pt.y,
      cardLeft,
      cardTop,
      originX: Math.max(16, Math.min(cardW - 16, pt.x - cardLeft)),
      originY: Math.max(0, Math.min(cardH, pt.y - cardTop)),
      isMobile,
    };
  }

  // ממקמים את הכרטיס צמוד לנקודת העצירה (משמאל או מימין לה) בלי לחרוג מגבולות המפה
  const gap = 22;
  const preferLeft = pt.x - gap - cardW >= 16;
  const rawLeft = preferLeft ? pt.x - gap - cardW : pt.x + gap;
  const cardLeft = Math.max(16, Math.min(W - cardW - 16, rawLeft));
  const rawTop = pt.y - cardH * 0.45;
  const cardTop = Math.max(96, Math.min(H - cardH - 16, rawTop));

  return {
    markerX: pt.x,
    markerY: pt.y,
    cardLeft,
    cardTop,
    originX: Math.max(0, Math.min(cardW, pt.x - cardLeft)),
    originY: Math.max(0, Math.min(cardH, pt.y - cardTop)),
    isMobile,
  };
}

export default function LiveMap({
  places,
  stops,
  tavernas,
  hotels,
  waterPath,
  routeName,
  mode = "planning",
}: Props) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const boatRef = useRef<mapboxgl.Marker | null>(null);
  const runId = useRef(0);
  const autoPlayed = useRef(false);
  const sailRef = useRef<() => void>(() => {});
  const continueResolver = useRef<(() => void) | null>(null);

  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<Place | null>(null);
  const [activeStop, setActiveStop] = useState<ActiveStop | null>(null);
  const [anchor, setAnchor] = useState<AnchorPos | null>(null);
  const [detail, setDetail] = useState<DetailView>(null);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, number>>({});
  const [clock, setClock] = useState<ClockState>(() => hoursToClock(START_HOUR));
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const legNms = useMemo(() => waterPath.legs.map((l) => pathLengthNm(l)), [waterPath]);
  const totalNm = useMemo(() => Math.round(legNms.reduce((s, x) => s + x, 0)), [legNms]);

  const tavernaByPlace = useMemo(() => {
    const m = new Map<string, Taverna[]>();
    for (const t of tavernas) {
      const list = m.get(t.placeId) ?? [];
      list.push(t);
      m.set(t.placeId, list);
    }
    return m;
  }, [tavernas]);

  const hotelByPlace = useMemo(() => {
    const m = new Map<string, Hotel[]>();
    for (const h of hotels) {
      const list = m.get(h.placeId) ?? [];
      list.push(h);
      m.set(h.placeId, list);
    }
    return m;
  }, [hotels]);

  const overviewBounds = useMemo(() => {
    const pts = waterPath.legs.flat();
    const lons = pts.map((p) => p[0]);
    const lats = pts.map((p) => p[1]);
    return [
      [Math.min(...lons), Math.min(...lats)],
      [Math.max(...lons), Math.max(...lats)],
    ] as [[number, number], [number, number]];
  }, [waterPath]);

  const styleCfg = MODE_STYLE[mode];

  useEffect(() => {
    if (!container.current || !token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [24.85, 37.2],
      zoom: 8,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");

    map.on("load", () => {
      map.fitBounds(overviewBounds, { padding: 60, duration: 0, maxZoom: 10 });
      const full: LngLat[] = waterPath.legs.flatMap((l, i) => (i === 0 ? l : l.slice(1)));
      const line = (coords: LngLat[]) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      });
      map.addSource("route-full", { type: "geojson", data: line(full) });
      const round = { "line-cap": "round", "line-join": "round" } as const;

      map.addLayer({
        id: "route-full-casing",
        type: "line",
        source: "route-full",
        layout: round,
        paint: {
          "line-color": "#0b1e28",
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 8, 13, 12],
          "line-opacity": 0.72,
        },
      });
      map.addLayer({
        id: "route-full",
        type: "line",
        source: "route-full",
        layout: round,
        paint: {
          "line-color": styleCfg.color,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 4.5, 13, 6.5],
          "line-opacity": 1,
          ...(styleCfg.dasharray ? { "line-dasharray": styleCfg.dasharray } : {}),
        },
      });

      map.addSource("route-drawn", { type: "geojson", data: line([]) });
      map.addLayer({
        id: "route-drawn-casing",
        type: "line",
        source: "route-drawn",
        layout: round,
        paint: {
          "line-color": "#0b1e28",
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 9, 13, 13],
          "line-opacity": 0.85,
        },
      });
      map.addLayer({
        id: "route-drawn",
        type: "line",
        source: "route-drawn",
        layout: round,
        paint: {
          "line-color": styleCfg.activeColor,
          "line-width": ["interpolate", ["linear"], ["zoom"], 8, 5.5, 13, 7.5],
          "line-opacity": 1,
          ...(styleCfg.dasharray ? { "line-dasharray": styleCfg.dasharray } : {}),
        },
      });
      setReady(true);
    });

    places.forEach((p) => {
      const el = document.createElement("button");
      el.className =
        "tmo-marker" +
        (p.type === "base" ? " tmo-marker--base" : p.overnight ? " tmo-marker--night" : "");
      el.setAttribute("aria-label", p.name);
      const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, className: "tmo-popup" }).setHTML(
        `<div dir="rtl">
          <img src="${escapeHtml(p.photoUrl)}" alt="${escapeHtml(p.name)}" class="tmo-popup-img" />
          <div class="tmo-popup-title">${escapeHtml(p.name)}</div>
          <div class="tmo-popup-text">${escapeHtml(p.desc)}</div>
        </div>`,
      );
      new mapboxgl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(popup).addTo(map);
    });

    const idRef = runId;
    return () => {
      idRef.current++;
      continueResolver.current?.();
      continueResolver.current = null;
      map.remove();
      mapRef.current = null;
      boatRef.current = null;
    };
  }, [places, waterPath, token, overviewBounds, styleCfg]);

  // עדכון עיגון הכרטיס אם המשתמש מזיז/משנה זום במפה בזמן שהכרטיס פתוח
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeStop) return;
    const sync = () => setAnchor(computeAnchor(map, activeStop.coord));
    sync();
    map.on("move", sync);
    map.on("resize", sync);
    return () => {
      map.off("move", sync);
      map.off("resize", sync);
    };
  }, [activeStop]);

  function showFullLine(full: boolean) {
    const map = mapRef.current;
    if (!map || !map.getLayer("route-full")) return;
    map.setPaintProperty("route-full", "line-opacity", full ? 1 : 0.32);
    map.setPaintProperty("route-full-casing", "line-opacity", full ? 0.72 : 0.22);
    if (full) {
      (map.getSource("route-drawn") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      });
    }
  }

  /** עוצר את הסירה ופותח כרטיס שמבצבץ מנקודת העצירה על המפה עד אינטראקציה */
  function waitForContinue(stopInfo: ActiveStop, alive: () => boolean) {
    if (!alive()) return Promise.resolve();
    const map = mapRef.current;
    setDetail(null);
    if (map) setAnchor(computeAnchor(map, stopInfo.coord));
    setActiveStop(stopInfo);
    return new Promise<void>((resolve) => {
      continueResolver.current = () => {
        continueResolver.current = null;
        setActiveStop(null);
        setDetail(null);
        setAnchor(null);
        resolve();
      };
    });
  }

  function handleContinue() {
    continueResolver.current?.();
  }

  async function animateClock(fromH: number, toH: number, ms: number, alive: () => boolean) {
    const t0 = performance.now();
    await new Promise<void>((resolve) => {
      const tick = (now: number) => {
        if (!alive()) return resolve();
        const f = Math.min((now - t0) / ms, 1);
        setClock(hoursToClock(fromH + (toH - fromH) * f));
        if (f < 1) requestAnimationFrame(tick);
        else resolve();
      };
      requestAnimationFrame(tick);
    });
  }

  async function sail() {
    const map = mapRef.current;
    if (!map || !ready) return;
    const id = ++runId.current;
    const alive = () => runId.current === id;
    continueResolver.current?.();
    continueResolver.current = null;
    setActiveStop(null);
    setDetail(null);
    setAnchor(null);
    setPlaying(true);
    setDone(false);
    showFullLine(false);

    const drawn = map.getSource("route-drawn") as mapboxgl.GeoJSONSource;
    const setLine = (coords: LngLat[]) =>
      drawn.setData({ type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: coords } });
    setLine([]);

    if (!boatRef.current) {
      const el = document.createElement("div");
      el.className = "tmo-boat-icon";
      el.innerHTML = BOAT_SVG;
      boatRef.current = new mapboxgl.Marker({ element: el, rotationAlignment: "map", pitchAlignment: "map" })
        .setLngLat(waterPath.stops[0])
        .addTo(map);
    }
    const boat = boatRef.current;
    boat.setLngLat(waterPath.stops[0]);
    let heading = bearing(
      waterPath.legs[0][0],
      waterPath.legs[0][Math.min(4, waterPath.legs[0].length - 1)],
    );
    boat.setRotation(heading);

    let tripHours = START_HOUR;
    setClock(hoursToClock(tripHours));

    const trail: LngLat[] = [waterPath.stops[0]];
    for (let i = 0; i < stops.length; i++) {
      if (!alive()) return;
      const s = stops[i];
      const stopCoord = waterPath.stops[i];
      setCurrent(s);

      // זום-אין לעצירה (המפה נשארת גלויה מאחורי הכרטיס, הנקודה מוזזת מעט כדי לפנות מקום לכרטיס)
      const isDesktop = (container.current?.clientWidth ?? 800) >= 640;
      map.flyTo({
        center: stopCoord,
        zoom: i === 0 || i === stops.length - 1 ? 14.5 : 12.6,
        offset: isDesktop ? [150, 0] : [0, -120],
        duration: 1350,
        essential: true,
      });
      await sleep(1400);
      if (!alive()) return;

      // Freeze בעצירה: כרטיס מבצבץ מהמרקר וממתין ללחיצת המשך
      await waitForContinue(
        {
          place: s,
          coord: stopCoord,
          index: i,
          isFirst: i === 0,
          isLast: i === stops.length - 1,
          nextStopName: stops[i + 1]?.name,
        },
        alive,
      );
      if (!alive()) return;

      if (i > 0 && i < stops.length - 1) {
        if (s.overnight) {
          const nextMorning = (Math.floor(tripHours / 24) + 1) * 24 + START_HOUR;
          await animateClock(tripHours, nextMorning, 900, alive);
          tripHours = nextMorning;
        } else if (s.dwellMin > 0) {
          const afterDwell = tripHours + s.dwellMin / 60;
          await animateClock(tripHours, afterDwell, 650, alive);
          tripHours = afterDwell;
        }
      }

      if (!alive() || i === stops.length - 1) break;

      const path = waterPath.legs[i];
      const nm = legNms[i];
      const sailHours = nm / CRUISE_KNOTS;
      const lons = path.map((p) => p[0]);
      const lats = path.map((p) => p[1]);
      map.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: 110, duration: 900, maxZoom: 12 },
      );
      await sleep(950);

      const dur = Math.max(1800, Math.min(4200, 1200 + nm * 110));
      const t0 = performance.now();
      const legStartH = tripHours;
      await new Promise<void>((resolve) => {
        const step = (now: number) => {
          if (!alive()) return resolve();
          const raw = Math.min((now - t0) / dur, 1);
          const f = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;
          const pos = pointAlong(path, f);
          const ahead = pointAlong(path, Math.min(f + 0.03, 1));
          const target = f < 0.97 ? bearing(pos, ahead) : bearing(pointAlong(path, 0.94), pos);
          heading = lerpAngle(heading, target, 0.2);
          boat.setRotation(heading);
          boat.setLngLat(pos);
          setLine([...trail, ...slicePath(path, f)]);
          setClock(hoursToClock(legStartH + sailHours * f));
          if (raw < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
      tripHours = legStartH + sailHours;
      trail.push(...path.slice(1));
    }

    if (alive()) {
      showFullLine(true);
      map.fitBounds(overviewBounds, { padding: 60, duration: 2000, maxZoom: 10 });
      setPlaying(false);
      setDone(true);
    }
  }

  function stop() {
    runId.current++;
    continueResolver.current?.();
    continueResolver.current = null;
    setActiveStop(null);
    setDetail(null);
    setAnchor(null);
    setPlaying(false);
    showFullLine(true);
  }

  useEffect(() => {
    sailRef.current = sail;
  });

  useEffect(() => {
    const el = container.current;
    if (!el || !ready) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting) && !autoPlayed.current) {
          autoPlayed.current = true;
          sailRef.current();
        }
      },
      { threshold: 0.45 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ready]);

  if (!token) {
    return (
      <div className="tmo-map-fallback">
        המפה תופיע כאן ברגע שיוגדר NEXT_PUBLIC_MAPBOX_TOKEN.
      </div>
    );
  }

  const elapsedDays = Math.floor(clock.elapsedHours / 24);
  const elapsedRemHours = Math.floor(clock.elapsedHours % 24);
  const stopTavernas = activeStop ? tavernaByPlace.get(activeStop.place.id) ?? [] : [];
  const stopHotels = activeStop ? hotelByPlace.get(activeStop.place.id) ?? [] : [];

  const continueLabel = activeStop
    ? activeStop.isLast
      ? "סיום המסע — חזרה למבט-על"
      : activeStop.isFirst
        ? `יוצאים לים ← ${activeStop.nextStopName}`
        : `המשך ← ${activeStop.nextStopName}`
    : "";

  return (
    <div className="tmo-map-wrap">
      <div ref={container} className="tmo-map" />

      {/* שעון מסע רץ — ימים + שעות בקצב 20 קשר */}
      <div className="tmo-clock" aria-live="polite">
        <div className="tmo-clock-mode">
          {mode === "planning" ? "מצב תכנון · 20 קשר" : "הפלגה בפועל"}
        </div>
        <div className="tmo-clock-main">
          יום {clock.day} · {pad2(clock.hour)}:{pad2(clock.minute)}
        </div>
        <div className="tmo-clock-sub">
          מצטבר: {elapsedDays} ימים ו-{elapsedRemHours} שעות · ~{totalNm} מייל ימי
        </div>
      </div>

      {/* טבעת דופק על נקודת העצירה הפעילה על המפה */}
      {activeStop && anchor && (
        <div
          className="tmo-stop-pulse"
          style={{ left: `${anchor.markerX}px`, top: `${anchor.markerY}px` }}
          aria-hidden="true"
        />
      )}

      {/* כרטיס עצירה שמבצבץ מנקודת העצירה על המפה (scale + fade) עם כפתור המשך sticky תמיד */}
      {activeStop && anchor && (
        <aside
          key={`${activeStop.place.id}-${activeStop.index}`}
          className="tmo-stop-pop"
          role="dialog"
          aria-label={activeStop.place.name}
          style={{
            left: `${anchor.cardLeft}px`,
            top: `${anchor.cardTop}px`,
            transformOrigin: `${anchor.originX}px ${anchor.originY}px`,
          }}
        >
          {/* תצוגת Detail של טברנה */}
          {detail?.kind === "taverna" ? (
            <>
              <div className="tmo-stop-modal-media">
                <img src={detail.item.photoUrl} alt={detail.item.name} />
                <button
                  type="button"
                  className="tmo-stop-back"
                  onClick={() => setDetail(null)}
                >
                  חזרה לטברנות →
                </button>
                <button
                  type="button"
                  className="tmo-stop-close"
                  onClick={handleContinue}
                  aria-label="סגור והמשך"
                >
                  ×
                </button>
              </div>
              <div className="tmo-stop-scroll">
                <p className="overline">טברנה על הרציף · {activeStop.place.islandName}</p>
                <h3>{detail.item.name}</h3>
                {detail.item.photoAttribution && (
                  <p className="photo-attr">{detail.item.photoAttribution}</p>
                )}

                <div className="tmo-detail-block">
                  <p className="sub-title">מה לאכול שם / תפריט</p>
                  <p className="tmo-stop-modal-desc">
                    {detail.item.note || "דגים טריים ומזטים מקומיים על קו המים."}
                  </p>
                  <p className="tmo-detail-slot">
                    תפריט מלא ומנות מומלצות נוספות יעלו כאן בקרוב.
                  </p>
                </div>

                <div className="tmo-detail-block">
                  <p className="sub-title">המלצות וביקורות</p>
                  <p className="tmo-detail-slot">
                    מקום אהוב על מפליגים ומשפחות בעצירה ב-{activeStop.place.name}. ביקורות נוספות יתווספו מה-DB.
                  </p>
                </div>
              </div>
            </>
          ) : detail?.kind === "hotel" ? (
            /* תצוגת Detail של מלון / מקום לינה */
            <>
              <div className="tmo-stop-modal-media">
                <img src={detail.item.photoUrl} alt={detail.item.name} />
                <button
                  type="button"
                  className="tmo-stop-back"
                  onClick={() => setDetail(null)}
                >
                  חזרה ללינות →
                </button>
                <button
                  type="button"
                  className="tmo-stop-close"
                  onClick={handleContinue}
                  aria-label="סגור והמשך"
                >
                  ×
                </button>
              </div>
              <div className="tmo-stop-scroll">
                <p className="overline">לינה על קו המים · {activeStop.place.islandName}</p>
                <h3>{detail.item.name}</h3>
                <p className="tmo-detail-price">
                  מ-€{Math.round(detail.item.priceEurCents / 100)} ללילה
                </p>
                {detail.item.photoAttribution && (
                  <p className="photo-attr">{detail.item.photoAttribution}</p>
                )}

                <div className="tmo-detail-block">
                  <p className="sub-title">על המקום וביקורות</p>
                  <p className="tmo-stop-modal-desc">
                    במרחק הליכה קצר מהעגינה ב-{activeStop.place.name} — לילה רגוע ושקט למשפחה מול המים.
                  </p>
                  <p className="tmo-detail-slot">
                    תמונות נוספות, פירוט חדרים וביקורות אורחים יתווספו כאן מה-DB.
                  </p>
                </div>

                {(() => {
                  const isPicked = selectedHotels[activeStop.place.id] === detail.item.id;
                  return (
                    <button
                      type="button"
                      className={`tmo-pick-btn ${isPicked ? "is-selected" : ""}`}
                      onClick={() =>
                        setSelectedHotels((prev) => ({
                          ...prev,
                          [activeStop.place.id]: detail.item.id,
                        }))
                      }
                    >
                      {isPicked ? "✓ נבחר ללילה הזה" : "בחרו את המלון הזה ללינה"}
                    </button>
                  );
                })()}
              </div>
            </>
          ) : (
            /* תצוגת עצירה ראשית */
            <>
              <div className="tmo-stop-modal-media">
                <img src={activeStop.place.photoUrl} alt={activeStop.place.name} />
                <span className="stop-tag">
                  {TYPE_LABEL[activeStop.place.type] ?? activeStop.place.type}
                </span>
                <button
                  type="button"
                  className="tmo-stop-close"
                  onClick={handleContinue}
                  aria-label="סגור והמשך"
                >
                  ×
                </button>
              </div>
              <div className="tmo-stop-scroll">
                <p className="overline">
                  יום {clock.day} · {activeStop.place.islandName}
                </p>
                <h3>{activeStop.place.name}</h3>
                <p className="tmo-stop-modal-desc">{activeStop.place.desc}</p>
                {activeStop.place.photoAttribution && (
                  <p className="photo-attr">{activeStop.place.photoAttribution}</p>
                )}

                {stopTavernas.length > 0 && (
                  <div className="tmo-stop-section">
                    <p className="sub-title">טברנות מומלצות — לחצו לתפריט והמלצות</p>
                    <div className="mini-grid">
                      {stopTavernas.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          className="mini-card mini-card-pick"
                          onClick={() => setDetail({ kind: "taverna", item: t })}
                        >
                          <img src={t.photoUrl} alt={t.name} />
                          <div className="mini-card-info">
                            <strong>{t.name}</strong>
                            <span>{t.note}</span>
                          </div>
                          <span className="mini-chevron" aria-hidden="true">‹</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {stopHotels.length > 0 && (
                  <div className="tmo-stop-section">
                    <p className="sub-title">איפה ישנים הלילה? לחצו לפרטים ובחירה</p>
                    <div className="mini-grid">
                      {stopHotels.map((h) => {
                        const selected = selectedHotels[activeStop.place.id] === h.id;
                        return (
                          <button
                            key={h.id}
                            type="button"
                            className={`mini-card mini-card-pick ${selected ? "is-selected" : ""}`}
                            onClick={() => setDetail({ kind: "hotel", item: h })}
                          >
                            <img src={h.photoUrl} alt={h.name} />
                            <div className="mini-card-info">
                              <strong>
                                {h.name} {selected ? "✓" : ""}
                              </strong>
                              <span>מ-€{Math.round(h.priceEurCents / 100)} ללילה</span>
                              {selected && <span className="pick-badge">נבחר ללילה הזה</span>}
                            </div>
                            <span className="mini-chevron" aria-hidden="true">‹</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* כפתור המשך קבוע (sticky) — גלוי תמיד גם בגלילה וגם ב-detail */}
          <div className="tmo-stop-footer">
            <button type="button" className="btn-brass tmo-stop-next" onClick={handleContinue}>
              {continueLabel}
            </button>
          </div>
        </aside>
      )}

      {!activeStop && (
        <div className="tmo-map-panel">
          <p className="overline">מסלול דגל שבועי</p>
          <h3>{routeName}</h3>
          <p className="tmo-map-now">
            {current ? `${current.name} — ${current.islandName}` : "יציאה וחזרה ממרינת לבריון, אטיקה."}
          </p>
          <button className="btn-brass" onClick={playing ? stop : sail} disabled={!ready}>
            {playing ? "נעצור לרגע" : done ? "שוב להפלגה" : "צאו איתנו להפלגה"}
          </button>
        </div>
      )}
    </div>
  );
}

// צללית סירת מנוע במבט מלמעלה (החרטום למעלה); מסתובבת עם Marker.setRotation
const BOAT_SVG = `<svg width="26" height="52" viewBox="0 0 40 80" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" style="display:block;filter:drop-shadow(0 3px 5px rgba(0,0,0,.55))">
  <path d="M20 2 C29 18 34 38 33 62 Q33 73 29 77 L11 77 Q7 73 7 62 C6 38 11 18 20 2 Z" fill="#fbf8f1" stroke="#0b1e28" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M20 9 C25 22 28 38 27.5 56 L12.5 56 C12 38 15 22 20 9 Z" fill="#c6a35a"/>
  <rect x="13" y="42" width="14" height="14" rx="4" fill="#0b1e28" opacity=".55"/>
  <rect x="16" y="76" width="8" height="5" rx="1.5" fill="#0b1e28"/>
</svg>`;

function bearing(a: LngLat, b: LngLat) {
  const dx = (b[0] - a[0]) * Math.cos((a[1] * Math.PI) / 180);
  const dy = b[1] - a[1];
  return ((Math.atan2(dx, dy) * 180) / Math.PI + 360) % 360;
}

function lerpAngle(from: number, to: number, k: number) {
  const d = ((to - from + 540) % 360) - 180;
  return (from + d * k + 360) % 360;
}

function slicePath(path: LngLat[], f: number): LngLat[] {
  if (path.length <= 1 || f <= 0) return [path[0]];
  if (f >= 1) return path;
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = f * total;
  const out: LngLat[] = [path[0]];
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] === 0 ? 0 : Math.min(d / lens[i], 1);
      out.push([
        path[i][0] + (path[i + 1][0] - path[i][0]) * k,
        path[i][1] + (path[i + 1][1] - path[i][1]) * k,
      ]);
      break;
    }
    out.push(path[i + 1]);
    d -= lens[i];
  }
  return out;
}

function pointAlong(path: LngLat[], f: number): LngLat {
  const s = slicePath(path, f);
  return s[s.length - 1];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}
