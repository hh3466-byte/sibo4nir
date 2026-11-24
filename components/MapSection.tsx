"use client";

import dynamic from "next/dynamic";
import type { Hotel, Place, Taverna, WaterPath } from "@/lib/geo";
import type { MapMode } from "./LiveMap";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => <div className="tmo-map-fallback">פורשים את המפה…</div>,
});

export default function MapSection(props: {
  places: Place[];
  stops: Place[];
  tavernas: Taverna[];
  hotels: Hotel[];
  waterPath: WaterPath;
  routeName: string;
  mode?: MapMode;
}) {
  return <LiveMap {...props} />;
}
