"use client";

import dynamic from "next/dynamic";
import type { BarberProfile } from "@/lib/types";

// Leaflet touches `window` on import, so the map only ever loads in the browser.
const BarberMap = dynamic(() => import("@/components/map/BarberMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-white/30 bg-white/15 text-sm text-muted-foreground backdrop-blur-xl sm:h-[540px]">
      Xarita yuklanmoqda...
    </div>
  ),
});

interface MapViewProps {
  barbers: BarberProfile[];
}

export default function MapView({ barbers }: MapViewProps) {
  return <BarberMap barbers={barbers} />;
}
