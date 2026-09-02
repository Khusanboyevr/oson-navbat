"use client";

import "leaflet/dist/leaflet.css";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import { createPinIcon } from "@/components/map/markerIcon";
import { DEFAULT_ZOOM, TASHKENT_CENTER, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";
import type { BarberProfile } from "@/lib/types";

interface BarberMapProps {
  barbers: BarberProfile[];
}

/** Keeps every marker in view as workers are added, removed or filtered. */
function FitToMarkers({ barbers }: BarberMapProps) {
  const map = useMap();

  useEffect(() => {
    if (barbers.length === 0) return;

    if (barbers.length === 1) {
      const [only] = barbers;
      map.setView([only.coordinates.lat, only.coordinates.lng], 14);
      return;
    }

    const bounds = barbers.map((barber) => [barber.coordinates.lat, barber.coordinates.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [barbers, map]);

  return null;
}

/**
 * The live map of every approved worker. It re-renders whenever the barber list
 * refreshes, so a newly approved usta appears without a deploy or a hard reload.
 */
export default function BarberMap({ barbers }: BarberMapProps) {
  const markers = useMemo(
    () => barbers.filter((barber) => barber.coordinates.lat !== 0 && barber.coordinates.lng !== 0),
    [barbers]
  );

  return (
    <div className="h-[420px] w-full overflow-hidden rounded-3xl border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] sm:h-[540px]">
      <MapContainer
        center={[TASHKENT_CENTER.lat, TASHKENT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <FitToMarkers barbers={markers} />

        {markers.map((barber) => (
          <Marker
            key={barber.id}
            position={[barber.coordinates.lat, barber.coordinates.lng]}
            icon={createPinIcon({
              color: barber.avatarColor,
              label: barber.name.charAt(0).toUpperCase(),
              photo: barber.photo,
            })}
          >
            <Popup>
              <div className="flex min-w-[200px] flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  {barber.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL from the applicant's upload
                    <img src={barber.photo} alt="" className="h-10 w-10 rounded-xl object-cover" />
                  ) : (
                    <span
                      className="flex h-10 w-10 items-center justify-center rounded-xl text-base font-bold text-white"
                      style={{ backgroundColor: barber.avatarColor }}
                    >
                      {barber.name.charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="!m-0 text-sm font-semibold text-foreground">{barber.name}</p>
                    <p className="!m-0 text-xs text-muted-foreground">{barber.specialty}</p>
                  </div>
                </div>

                <p className="!m-0 text-xs text-muted-foreground">{barber.location}</p>

                <Link
                  href={`/barber/${barber.id}`}
                  className="!mt-1 block rounded-lg bg-primary px-3 py-2 text-center text-xs font-semibold !text-primary-foreground !no-underline"
                >
                  Bron qilish
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
