"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Place, WaterPath } from "@/lib/geo";
import type { LngLat } from "@/lib/geo/routing";

type Props = {
  places: Place[];
  stops: Place[];
  waterPath: WaterPath;
  routeName: string;
};

const BRASS = "#c6a35a";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function LiveMap({ places, stops, waterPath, routeName }: Props) {
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
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  useEffect(() => {
    if (!container.current || !token) return;
    mapboxgl.accessToken = token;
    const map = new mapboxgl.Map({
      container: container.current,
      style: "mapbox://styles/mapbox/satellite-v9",
      center: [25.3, 37.05],
      zoom: 8.6,
      attributionControl: true,
    });
    mapRef.current = map;
    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-left");

    map.on("load", () => {
      const full: LngLat[] = waterPath.legs.flatMap((l, i) => (i === 0 ? l : l.slice(1)));
      const line = (coords: LngLat[]) => ({
        type: "Feature" as const,
        properties: {},
        geometry: { type: "LineString" as const, coordinates: coords },
      });
      map.addSource("route-full", { type: "geojson", data: line(full) });
      const round = { "line-cap": "round", "line-join": "round" } as const;
      // ברירת מחדל: קו פליז מלא ועבה, עם קו כהה מתחתיו לניגודיות על הלוויין
      map.addLayer({
        id: "route-full-casing",
        type: "line",
        source: "route-full",
        layout: round,
        paint: { "line-color": "#0b1e28", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 9, 13, 13], "line-opacity": 0.75 },
      });
      map.addLayer({
        id: "route-full",
        type: "line",
        source: "route-full",
        layout: round,
        paint: { "line-color": BRASS, "line-width": ["interpolate", ["linear"], ["zoom"], 8, 5, 13, 7], "line-opacity": 1 },
      });
      // שכבת ההפלגה (נצבעת תוך כדי תנועת הסירה)
      map.addSource("route-drawn", { type: "geojson", data: line([]) });
      map.addLayer({
        id: "route-drawn-casing",
        type: "line",
        source: "route-drawn",
        layout: round,
        paint: { "line-color": "#0b1e28", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 10, 13, 14], "line-opacity": 0.85 },
      });
      map.addLayer({
        id: "route-drawn",
        type: "line",
        source: "route-drawn",
        layout: round,
        paint: { "line-color": "#e3c77f", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 6, 13, 8], "line-opacity": 1 },
      });
      setReady(true);
    });

    places.forEach((p) => {
      const el = document.createElement("button");
      el.className = "tmo-marker" + (p.overnight ? " tmo-marker--night" : "");
      el.setAttribute("aria-label", p.name);
      const popup = new mapboxgl.Popup({ offset: 14, closeButton: false, className: "tmo-popup" }).setHTML(
        `<div dir="rtl"><div class="tmo-popup-title">${escapeHtml(p.name)}</div><div class="tmo-popup-text">${escapeHtml(p.desc)}</div></div>`,
      );
      new mapboxgl.Marker({ element: el }).setLngLat([p.lon, p.lat]).setPopup(popup).addTo(map);
    });

    return () => {
      runId.current++;
      map.remove();
      mapRef.current = null;
      boatRef.current = null;
    };
  }, [places, waterPath, token]);

  // במהלך ההפלגה הקו המלא מתעמעם והקו הנצבע בולט; בסיום/עצירה הקו המלא חוזר מלא
  function showFullLine(full: boolean) {
    const map = mapRef.current;
    if (!map || !map.getLayer("route-full")) return;
    map.setPaintProperty("route-full", "line-opacity", full ? 1 : 0.3);
    map.setPaintProperty("route-full-casing", "line-opacity", full ? 0.75 : 0.2);
    if (full) {
      (map.getSource("route-drawn") as mapboxgl.GeoJSONSource).setData({
        type: "Feature",
        properties: {},
        geometry: { type: "LineString", coordinates: [] },
      });
    }
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

    // אותה סירה לכל אורך המסלול: marker יחיד שנע
    if (!boatRef.current) {
      const el = document.createElement("div");
      el.className = "tmo-boat";
      boatRef.current = new mapboxgl.Marker({ element: el }).setLngLat(waterPath.stops[0]).addTo(map);
    }
    const boat = boatRef.current;
    boat.setLngLat(waterPath.stops[0]);

    const trail: LngLat[] = [waterPath.stops[0]];
    for (let i = 0; i < stops.length; i++) {
      if (!alive()) return;
      const s = stops[i];
      setCurrent(s);
      map.flyTo({ center: waterPath.stops[i], zoom: 12.8, duration: 2600, essential: true });
      await sleep(3200);
      if (!alive() || i === stops.length - 1) break;

      const path = waterPath.legs[i];
      const lons = path.map((p) => p[0]);
      const lats = path.map((p) => p[1]);
      map.fitBounds(
        [
          [Math.min(...lons), Math.min(...lats)],
          [Math.max(...lons), Math.max(...lats)],
        ],
        { padding: 140, duration: 1600, maxZoom: 12 },
      );
      await sleep(1700);
      const dur = 2600;
      const t0 = performance.now();
      await new Promise<void>((resolve) => {
        const step = (now: number) => {
          if (!alive()) return resolve();
          const raw = Math.min((now - t0) / dur, 1);
          const f = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2; // תנועה חלקה
          const pos = pointAlong(path, f);
          boat.setLngLat(pos);
          setLine([...trail, pos]);
          if (raw < 1) requestAnimationFrame(step);
          else resolve();
        };
        requestAnimationFrame(step);
      });
      trail.push(...path.slice(1));
    }
    if (alive()) {
      showFullLine(true);
      map.flyTo({ center: [25.3, 37.05], zoom: 8.6, duration: 2600 });
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

  // הפעלה אוטומטית פעם אחת כשהמפה נכנסת לאזור הראייה; אחר כך רק מהכפתור
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
      { threshold: 0.5 },
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

  return (
    <div className="tmo-map-wrap">
      <div ref={container} className="tmo-map" />
      <div className="tmo-map-panel">
        <p className="overline">מסלול דגל</p>
        <h3>{routeName}</h3>
        <p className="tmo-map-now">{current ? current.name : "מפרצים שמגיעים אליהם רק מהים."}</p>
        <button className="btn-brass" onClick={playing ? stop : sail} disabled={!ready}>
          {playing ? "נעצור לרגע" : done ? "שוב להפלגה" : "צאו איתנו להפלגה"}
        </button>
      </div>
    </div>
  );
}

function pointAlong(path: LngLat[], f: number): LngLat {
  if (path.length === 1) return path[0];
  const lens: number[] = [];
  let total = 0;
  for (let i = 1; i < path.length; i++) {
    const l = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]);
    lens.push(l);
    total += l;
  }
  let d = f * total;
  for (let i = 0; i < lens.length; i++) {
    if (d <= lens[i] || i === lens.length - 1) {
      const k = lens[i] === 0 ? 0 : Math.min(d / lens[i], 1);
      return [
        path[i][0] + (path[i + 1][0] - path[i][0]) * k,
        path[i][1] + (path[i + 1][1] - path[i][1]) * k,
      ];
    }
    d -= lens[i];
  }
  return path[path.length - 1];
}

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
}


