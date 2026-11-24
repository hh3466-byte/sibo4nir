"use client";

import dynamic from "next/dynamic";
import type { Place, WaterPath } from "@/lib/geo";

const LiveMap = dynamic(() => import("./LiveMap"), {
  ssr: false,
  loading: () => <div className="tmo-map-fallback">פורשים את המפה…</div>,
});

export default function MapSection(props: { places: Place[]; stops: Place[]; waterPath: WaterPath; routeName: string }) {
  return <LiveMap {...props} />;
}

