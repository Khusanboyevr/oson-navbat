"use client";

import { Map, Placemark, YMaps, ZoomControl } from "@pbe/react-yandex-maps";
import type { Barber } from "@/lib/barbers";
import { TASHKENT_CENTER, YANDEX_MAPS_API_KEY } from "@/lib/map";

interface YandexMapProps {
  barbers: Barber[];
}

function buildBalloonContent(barber: Barber): string {
  return `
    <div style="display:flex;flex-direction:column;gap:8px;padding:4px;min-width:200px;font-family:inherit;">
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="display:flex;height:40px;width:40px;flex-shrink:0;align-items:center;justify-content:center;border-radius:12px;color:#fff;font-weight:700;font-size:16px;background:${barber.avatarColor};">
          ${barber.name.charAt(0)}
        </span>
        <div>
          <div style="font-weight:600;font-size:14px;color:#2a2420;">${barber.name}</div>
          <div style="font-size:12px;color:#7c7264;">${barber.specialty}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#7c7264;">
        <span>⭐ ${barber.rating.toFixed(1)}</span>
        <span>${barber.location}</span>
      </div>
      <a href="/barber/${barber.id}" style="margin-top:4px;display:block;text-align:center;border-radius:10px;background:#041449;color:#ffffff;font-weight:600;font-size:13px;padding:8px 12px;text-decoration:none;">
        Bron qilish
      </a>
    </div>
  `;
}

export default function YandexMap({ barbers }: YandexMapProps) {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] sm:h-[540px]">
      <YMaps query={{ apikey: YANDEX_MAPS_API_KEY, lang: "ru_RU" }}>
        <Map
          defaultState={{ center: [TASHKENT_CENTER.lat, TASHKENT_CENTER.lng], zoom: 11 }}
          width="100%"
          height="100%"
          modules={["control.ZoomControl", "geoObject.addon.balloon", "geoObject.addon.hint"]}
        >
          <ZoomControl options={{ position: { right: 10, top: 10 } }} />
          {barbers.map((barber) => (
            <Placemark
              key={barber.id}
              geometry={[barber.coordinates.lat, barber.coordinates.lng]}
              properties={{
                hintContent: barber.name,
                balloonContent: buildBalloonContent(barber),
              }}
              options={{
                preset: "islands#circleIcon",
                iconColor: barber.avatarColor,
              }}
            />
          ))}
        </Map>
      </YMaps>
    </div>
  );
}
