"use client";

import dynamic from "next/dynamic";
import MapPlaceholder from "@/components/home/MapPlaceholder";
import type { Barber } from "@/lib/barbers";
import { YANDEX_MAPS_API_KEY } from "@/lib/map";

const YandexMap = dynamic(() => import("@/components/home/YandexMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[420px] w-full items-center justify-center rounded-3xl border border-white/30 bg-white/15 text-sm text-muted-foreground backdrop-blur-xl sm:h-[540px]">
      Xarita yuklanmoqda...
    </div>
  ),
});

interface MapViewProps {
  barbers: Barber[];
}

export default function MapView({ barbers }: MapViewProps) {
  if (!YANDEX_MAPS_API_KEY) {
    return <MapPlaceholder barbers={barbers} />;
  }

  return <YandexMap barbers={barbers} />;
}
