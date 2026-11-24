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

const KIND_LABEL: Record<string, string> = {
  hotel: "מלון",
  airbnb: "Airbnb",
  guesthouse: "בית אירוח",
  room: "חדר אירוח",
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
  return { day, hour, minute };
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

  const cardW = isMobile ? W - 24 : Math.min(560, W - 40);
  const cardH = Math.min(600, Math.round(H * 0.88));

  if (isMobile) {
    const cardLeft = 12;
    const cardTop = Math.max(66, H - cardH - 12);
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

  // ממקמים את הכרטיס בצד הנגדי לנקודת העצירה כדי שלא יסתיר אותה
  const markerOnRight = pt.x >= W * 0.5;
  const gap = 24;
  const rawLeft = markerOnRight ? pt.x - gap - cardW : pt.x + gap;
  const cardLeft = Math.max(16, Math.min(W - cardW - 16, rawLeft));
  const rawTop = pt.y - cardH * 0.48;
  const cardTop = Math.max(16, Math.min(H - cardH - 16, rawTop));

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

/** רצועת תמונות אופקית (filmstrip marquee) דומיננטית (~290px) — 3-4 תמונות בו-זמנית, גלילה רציפה, pause on hover */
function PhotoCarousel({
  photos,
  alt,
  onPhotoClick,
  children,
}: {
  photos: string[];
  alt: string;
  onPhotoClick?: (src: string) => void;
  children?: React.ReactNode;
}) {
  const list = photos.length > 0 ? photos : ["/img/e1.jpg"];
  const isSingle = list.length <= 1;
  const trackItems = isSingle ? list : [...list, ...list];
  const durationSec = Math.max(16, list.length * 4.2);

  return (
    <div
      className="tmo-stop-modal-media"
      style={{ position: "relative", flexShrink: 0, overflow: "hidden", direction: "ltr" }}
    >
      {isSingle ? (
        <img
          src={list[0]}
          alt={alt}
          className="tmo-photo-single"
          style={onPhotoClick ? { cursor: "zoom-in" } : undefined}
          onClick={onPhotoClick ? () => onPhotoClick(list[0]) : undefined}
        />
      ) : (
        <div
          className="tmo-filmstrip-track"
          style={{ animationDuration: `${durationSec}s` }}
        >
          {trackItems.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              className="tmo-filmstrip-item"
              aria-label={alt}
              onClick={onPhotoClick ? () => onPhotoClick(src) : undefined}
            >
              <img src={src} alt={alt} />
            </button>
          ))}
        </div>
      )}
      {children}
    </div>
  );
}

/** מבחר אופציות (מלונות/טברנות) — רצועה אופקית מסתובבת כמו התמונות, נעצרת בריחוף, כל אריח לחיץ */
function OptionCarousel<T extends { id: number; name: string; photoUrl: string }>({
  title,
  items,
  selectedId,
  renderMeta,
  onSelect,
}: {
  title: string;
  items: T[];
  selectedId?: number;
  renderMeta: (item: T) => React.ReactNode;
  onSelect: (item: T) => void;
}) {
  // עצירת הקרוסלה בריחוף — דרך state מובטח, כדי שלחיצה על אריח נע תמיד תיפתח
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;
  const isSingle = items.length <= 1;
  const strip = isSingle ? items : [...items, ...items];
  const durationSec = Math.max(14, items.length * 5);

  return (
    <div className="tmo-stop-section">
      <p className="sub-title">{title}</p>
      <div
        className="tmo-opt-strip"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div
          className={`tmo-opt-track ${isSingle ? "is-single" : ""}`}
          style={isSingle ? undefined : { animationDuration: `${durationSec}s`, ...(paused ? { animationPlayState: "paused" } : {}) }}
        >
          {strip.map((item, i) => {
            const isSelected = selectedId !== undefined && selectedId === item.id;
            return (
              <button
                key={`${item.id}-${i}`}
                type="button"
                className={`tmo-opt-tile ${isSelected ? "is-selected" : ""}`}
                onPointerDown={() => onSelect(item)}
              >
                <img src={item.photoUrl} alt={item.name} />
                <div className="tmo-opt-tile-label">
                  <strong>
                    {item.name} {isSelected ? "✓" : ""}
                  </strong>
                  <span className="tmo-opt-tile-meta">{renderMeta(item)}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
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
  const sailRef = useRef<() => void>(() => { });
  const continueResolver = useRef<(() => void) | null>(null);

  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<Place | null>(null);
  const [activeStop, setActiveStop] = useState<ActiveStop | null>(null);
  const [anchor, setAnchor] = useState<AnchorPos | null>(null);
  const [detail, setDetail] = useState<DetailView>(null);
  const [lightbox, setLightbox] = useState<string | null>(null);
  const [selectedHotels, setSelectedHotels] = useState<Record<string, number>>({});
  // עגינה והגעה לחוף לכל תחנה — ניתן לעריכה; בעתיד יוזן ע״י השייטים (רשת חברתית)
  const [mooring, setMooring] = useState<Record<string, string>>({});
  const [clock, setClock] = useState<ClockState>(() => hoursToClock(START_HOUR));
  const [sailedNm, setSailedNm] = useState(0);
  const [legNm, setLegNm] = useState(0);
  const [dayNm, setDayNm] = useState(0);
  const [speed, setSpeed] = useState(CRUISE_KNOTS);
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
      cooperativeGestures: true,
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
    setSailedNm(0);
    setLegNm(0);
    setDayNm(0);
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
    let completedNm = 0;
    let dayStartNm = 0;
    setClock(hoursToClock(tripHours));

    const trail: LngLat[] = [waterPath.stops[0]];
    for (let i = 0; i < stops.length; i++) {
      if (!alive()) return;
      const s = stops[i];
      const stopCoord = waterPath.stops[i];
      setCurrent(s);

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
          dayStartNm = completedNm;
          setDayNm(0);
        } else if (s.dwellMin > 0) {
          const afterDwell = tripHours + s.dwellMin / 60;
          await animateClock(tripHours, afterDwell, 650, alive);
          tripHours = afterDwell;
        }
      }

      if (!alive() || i === stops.length - 1) break;

      const path = waterPath.legs[i];
      const nm = legNms[i];
      const sailHours = nm / speed;
      setLegNm(nm);
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
      const legStartNm = completedNm;
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
          // אודומטר חי: מתעדכן בזמן אמת תוך כדי כל לג
          setSailedNm(legStartNm + nm * f);
          setDayNm(legStartNm + nm * f - dayStartNm);
          if (raw < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
      tripHours = legStartH + sailHours;
      completedNm = legStartNm + nm;
      setSailedNm(completedNm);
      setDayNm(completedNm - dayStartNm);
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

  // חישוב שעות שיט נטו (בלי שעות לינה) מתוך האודומטר החי
  const sailTotalMin = Math.round((sailedNm / speed) * 60);
  const sailH = Math.floor(sailTotalMin / 60);
  const sailM = sailTotalMin % 60;

  const stopTavernas = activeStop ? tavernaByPlace.get(activeStop.place.id) ?? [] : [];
  const stopHotels = activeStop ? hotelByPlace.get(activeStop.place.id) ?? [] : [];

  const continueLabel = activeStop
    ? activeStop.isLast
      ? "סיום המסע — חזרה למבט-על"
      : activeStop.isFirst
        ? `יוצאים לים ← ${activeStop.nextStopName}`
        : `המשך ← ${activeStop.nextStopName}`
    : "";

  const hotelsCarousel = activeStop && stopHotels.length > 0 && (
    <OptionCarousel
      key={`hotels-${activeStop.place.id}`}
      title="איפה ישנים הלילה?"
      items={stopHotels}
      selectedId={selectedHotels[activeStop.place.id]}
      renderMeta={(h) => (
        <span className="tmo-kind-row">
          <span className="tmo-kind-tag">{KIND_LABEL[h.kind] ?? "מלון"}</span>
          <span>מ-€{Math.round(h.priceEurCents / 100)} ללילה</span>
        </span>
      )}
      onSelect={(h) => setDetail({ kind: "hotel", item: h })}
    />
  );

  const tavernasCarousel = activeStop && stopTavernas.length > 0 && (
    <OptionCarousel
      key={`tavernas-${activeStop.place.id}`}
      title={activeStop.place.overnight ? "טברנות לארוחת ערב" : "טברנות מומלצות לצהריים"}
      items={stopTavernas}
      renderMeta={(t) => <span>{t.note}</span>}
      onSelect={(t) => setDetail({ kind: "taverna", item: t })}
    />
  );

  return (
    <div className="tmo-map-wrap" style={{ position: "relative" }}>
      <div ref={container} className="tmo-map" />

      {/* אודומטר ושעון מסע חי — ימים + שעה + מיילים ושעות שיט נטו */}
      <div className="tmo-clock" aria-live="polite">
        <div className="tmo-clock-mode">
          {mode === "planning" ? "מצב תכנון" : "הפלגה בפועל"}
        </div>
        <div className="tmo-clock-main">
          יום {clock.day} · {pad2(clock.hour)}:{pad2(clock.minute)}
        </div>
        <div className="tmo-clock-sub">
          לג נוכחי: {Math.round(legNm)} מ״י · היום: {Math.round(dayNm)} מ״י
        </div>
        <div className="tmo-clock-sub">
          מצטבר: {Math.round(sailedNm)}/{totalNm} מ״י · {sailH}ש׳ {sailM}ד׳
        </div>
        <div className="tmo-speed">
          <span className="tmo-speed-label">מהירות</span>
          <button type="button" className="tmo-speed-btn" aria-label="האט" onClick={() => setSpeed((s) => Math.max(6, s - 1))}>−</button>
          <span className="tmo-speed-val">{speed} קשר</span>
          <button type="button" className="tmo-speed-btn" aria-label="האץ" onClick={() => setSpeed((s) => Math.min(35, s + 1))}>+</button>
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

      {/* כרטיס עצירה overlay קומפקטי מעל המפה עם קרוסלות וכפתור המשך sticky */}
      {activeStop && anchor && (
        <aside
          key={`${activeStop.place.id}-${activeStop.index}`}
          className="tmo-stop-pop"
          role="dialog"
          aria-label={activeStop.place.name}
          style={{
            position: "absolute",
            left: `${anchor.cardLeft}px`,
            top: `${anchor.cardTop}px`,
            maxWidth: anchor.isMobile ? "calc(100% - 24px)" : "560px",
            maxHeight: "min(88%, 600px)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            transformOrigin: `${anchor.originX}px ${anchor.originY}px`,
          }}
        >
          {detail?.kind === "taverna" ? (
            <>
              <PhotoCarousel key={`${detail.kind}-${detail.item.id}`} photos={detail.item.photoUrls} alt={detail.item.name} onPhotoClick={setLightbox}>
                <button type="button" className="tmo-stop-back" onClick={() => setDetail(null)}>
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
              </PhotoCarousel>
              <div className="tmo-stop-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
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
            <>
              <PhotoCarousel key={`${detail.kind}-${detail.item.id}`} photos={detail.item.photoUrls} alt={detail.item.name} onPhotoClick={setLightbox}>
                <button type="button" className="tmo-stop-back" onClick={() => setDetail(null)}>
                  חזרה למלונות →
                </button>
                <button
                  type="button"
                  className="tmo-stop-close"
                  onClick={handleContinue}
                  aria-label="סגור והמשך"
                >
                  ×
                </button>
              </PhotoCarousel>
              <div className="tmo-stop-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <p className="overline">
                  {KIND_LABEL[detail.item.kind] ?? "לינה"} על קו המים · {activeStop.place.islandName}
                </p>
                <h3>{detail.item.name}</h3>
                <p className="tmo-detail-price">
                  <span className="tmo-kind-tag">{KIND_LABEL[detail.item.kind] ?? "מלון"}</span>{" "}
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
                    פירוט חדרים וביקורות אורחים נוספות יתווספו כאן מה-DB.
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
            <>
              <PhotoCarousel key={`p-${activeStop.place.id}`} photos={activeStop.place.photoUrls} alt={activeStop.place.name} onPhotoClick={setLightbox}>
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
              </PhotoCarousel>
              <div className="tmo-stop-scroll" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                <p className="overline">
                  יום {clock.day} · {activeStop.place.islandName}
                </p>
                <h3>{activeStop.place.name}</h3>
                {activeStop.place.photoAttribution && (
                  <p className="photo-attr">{activeStop.place.photoAttribution}</p>
                )}

                {/* בעצירת לינה: מלונות + טברנות (זה-לצד-זה במחשב, מוערם בטלפון); בצהריים: טברנות — קודם, כי זו הבחירה המרכזית */}
                <div className="tmo-stop-selections">
                  {activeStop.place.overnight ? (
                    <>
                      {hotelsCarousel}
                      {tavernasCarousel}
                    </>
                  ) : (
                    tavernasCarousel
                  )}
                </div>

                {/* עגינה והגעה לחוף — מפרץ שחייה: תג עוגן; תחנה עם טברנה/מלון: בורר הגעה-לחוף הניתן לעריכה */}
                {!activeStop.isFirst && !activeStop.isLast && (() => {
                  const anchorIcon = (
                    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="5" r="2.2" />
                      <line x1="12" y1="22" x2="12" y2="7.2" />
                      <path d="M5 12H2a10 10 0 0 0 20 0h-3" />
                      <line x1="8.4" y1="10.6" x2="15.6" y2="10.6" />
                    </svg>
                  );
                  // מפרץ שחייה / שנירקול / עוגן-וצילום — עוגנים בלבד, לא יורדים לחוף
                  const anchorOnly = ["swim", "snorkel", "anchor"].includes(activeStop.place.type);
                  if (anchorOnly) {
                    return (
                      <div className="tmo-mooring">
                        <div className="tmo-anchor-note">
                          <span className="tmo-anchor-ico">{anchorIcon}</span>
                          <div>
                            <strong>עוגנים כאן · {TYPE_LABEL[activeStop.place.type] ?? "מפרץ שחייה"}</strong>
                            <span>עוגנים מול החוף · שחייה מהסירה או אל החוף</span>
                          </div>
                        </div>
                      </div>
                    );
                  }
                  const modes = [
                    { id: "med", label: "היקשרות לרציף", sub: "ירכתיים או צד (long-side) · יורדים ישר למזח" },
                    { id: "anchor", label: "עוגן · שחייה או סאפ", sub: "נקשרים מול החוף וחוצים מים קצר" },
                    { id: "pickup", label: "איסוף בסירה", sub: "הטברנה או המלון אוספים מהעוגן" },
                  ];
                  const cur = mooring[activeStop.place.id];
                  return (
                    <div className="tmo-mooring">
                      <p className="sub-title tmo-mooring-head">
                        <span className="tmo-anchor-ico">{anchorIcon}</span>
                        עגינה והגעה לחוף{cur ? "" : " · לבדוק"}
                      </p>
                      <div className="tmo-mooring-chips">
                        {modes.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className={`tmo-mooring-chip ${cur === m.id ? "is-on" : ""}`}
                            onClick={() =>
                              setMooring((p) => ({ ...p, [activeStop.place.id]: m.id }))
                            }
                          >
                            <strong>{m.label}</strong>
                            <em>{m.sub}</em>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* טיול בתוך האי — המלצה להקדיש כמה שעות לאטרקציות ביבשה (בעצירות עם יבשה) */}
                {["lunch", "overnight"].includes(activeStop.place.type) && (
                  <div className="tmo-island">
                    <p className="sub-title tmo-island-head">
                      <span className="tmo-island-ico">
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6" />
                          <line x1="8" y1="2" x2="8" y2="18" />
                          <line x1="16" y1="6" x2="16" y2="22" />
                        </svg>
                      </span>
                      טיול בתוך האי · {activeStop.place.islandName}
                    </p>
                    <p className="tmo-island-note">
                      שווה להקדיש כמה שעות לגלות את {activeStop.place.islandName} מבפנים — כפרים, נופים ואתרים.
                      המלצות לטיול ולאטרקציות יתווספו כאן.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* כפתור המשך קבוע (sticky) בתחתית הכרטיס — גלוי תמיד */}
          <div className="tmo-stop-footer" style={{ position: "sticky", bottom: 0, flexShrink: 0 }}>
            <button type="button" className="btn-brass tmo-stop-next" onClick={handleContinue}>
              {continueLabel}
            </button>
          </div>
        </aside>
      )}

      {/* תצוגת תמונה מוגדלת (lightbox) — נפתחת בלחיצה על כל תמונה */}
      {lightbox && (
        <div className="tmo-lightbox" onClick={() => setLightbox(null)}>
          <img src={lightbox} alt="" />
          <button
            type="button"
            className="tmo-lightbox-close"
            aria-label="סגור"
            onClick={() => setLightbox(null)}
          >
            ×
          </button>
        </div>
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
