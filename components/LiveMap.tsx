"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Place, WaterPath } from "@/lib/geo";
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

const CRUISE_KNOTS = 20;
const START_HOUR = 9; // יציאה יום 1 בשעה 09:00

type Props = {
  places: Place[];
  stops: Place[];
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

export default function LiveMap({
  places,
  stops,
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
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [current, setCurrent] = useState<Place | null>(null);
  const [clock, setClock] = useState<ClockState>(() => hoursToClock(START_HOUR));
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  const legNms = useMemo(() => waterPath.legs.map((l) => pathLengthNm(l)), [waterPath]);
  const totalNm = useMemo(() => Math.round(legNms.reduce((s, x) => s + x, 0)), [legNms]);

  // מרכז וגבולות כלל המסלול
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
      center: [25.18, 36.93],
      zoom: 8.5,
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

      // מצב תכנון: קו מקווקו ברור בצבע פליז, עם קו כהה מתחתיו לניגודיות על הלוויין
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

      // הקו שנמשך מאחורי הסירה תוך כדי ההפלגה
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
      map.remove();
      mapRef.current = null;
      boatRef.current = null;
    };
  }, [places, waterPath, token, overviewBounds, styleCfg]);

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
      setCurrent(s);

      // זום-אין לעצירה
      map.flyTo({
        center: waterPath.stops[i],
        zoom: i === 0 || i === stops.length - 1 ? 14.5 : 12.2,
        duration: 1400,
        essential: true,
      });

      // שהייה בעצירה או לינה (מקפיצה את השעון לבוקר הבא 09:00)
      if (i > 0 && i < stops.length - 1) {
        if (s.overnight) {
          const nextMorning = (Math.floor(tripHours / 24) + 1) * 24 + START_HOUR;
          await animateClock(tripHours, nextMorning, 1500, alive);
          tripHours = nextMorning;
        } else if (s.dwellMin > 0) {
          const afterDwell = tripHours + s.dwellMin / 60;
          await animateClock(tripHours, afterDwell, 1200, alive);
          tripHours = afterDwell;
        } else {
          await sleep(1100);
        }
      } else {
        await sleep(1600);
      }

      if (!alive() || i === stops.length - 1) break;

      const path = waterPath.legs[i];
      const nm = legNms[i];
      const sailHours = nm / CRUISE_KNOTS; // קצב 20 קשר
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

      // משך האנימציה יחסי למרחק (לאט וברור, 1.8–4.2 שניות למקטע)
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

      <div className="tmo-map-panel">
        <p className="overline">מסלול דגל שבועי</p>
        <h3>{routeName}</h3>
        <p className="tmo-map-now">
          {current ? `${current.name} — ${current.islandName}` : "יציאה וחזרה ממרינת נאוסה, פארוס."}
        </p>
        <button className="btn-brass" onClick={playing ? stop : sail} disabled={!ready}>
          {playing ? "נעצור לרגע" : done ? "שוב להפלגה" : "צאו איתנו להפלגה"}
        </button>
      </div>
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
