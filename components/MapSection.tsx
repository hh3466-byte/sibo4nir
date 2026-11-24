"use client";

import dynamic from "next/dynamic";
import type { Place, WaterPath } from "@/lib/geo";
import type { MapMode } from "./LiveMap";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => <div className="tmo-map-fallback">פורשים את המפה…</div>,
});

export default function MapSection(props: {
  places: Place[];
  stops: Place[];
  waterPath: WaterPath;
  routeName: string;
  mode?: MapMode;
}) {
  return <LiveMap {...props} />;
}
