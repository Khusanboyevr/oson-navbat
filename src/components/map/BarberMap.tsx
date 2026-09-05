"use client";

import "leaflet/dist/leaflet.css";

import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap } from "react-leaflet";
import BarberDetailPanel from "@/components/map/BarberDetailPanel";
import MapSearch from "@/components/map/MapSearch";
import { createPinIcon } from "@/components/map/markerIcon";
import { DEFAULT_ZOOM, TASHKENT_CENTER, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";
import type { BarberProfile, Coordinates } from "@/lib/types";

interface BarberMapProps {
  barbers: BarberProfile[];
}

interface MapTarget {
  coordinates: Coordinates;
  zoom: number;
  /** Bumped on every request so selecting the same place twice still recenters. */
  nonce: number;
}

/** Fits every marker in view — but only until the user searches or picks an usta. */
function FitToMarkers({ barbers, enabled }: { barbers: BarberProfile[]; enabled: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (!enabled || barbers.length === 0) return;

    if (barbers.length === 1) {
      const [only] = barbers;
      map.setView([only.coordinates.lat, only.coordinates.lng], 14);
      return;
    }

    const bounds = barbers.map((barber) => [barber.coordinates.lat, barber.coordinates.lng] as [number, number]);
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [barbers, enabled, map]);

  return null;
}

/** Flies to a searched place or a selected usta. */
function FlyTo({ target }: { target: MapTarget | null }) {
  const map = useMap();

  useEffect(() => {
    if (!target) return;
    map.flyTo([target.coordinates.lat, target.coordinates.lng], target.zoom, { duration: 0.8 });
  }, [target, map]);

  return null;
}

/**
 * The live map of every approved worker: search for a place or an usta, tap a pin
 * to read the full profile, book from the panel's footer. It re-renders whenever
 * the barber list refreshes, so a newly approved usta appears without a reload.
 */
export default function BarberMap({ barbers }: BarberMapProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [target, setTarget] = useState<MapTarget | null>(null);
  const nonceRef = useRef(0);

  const markers = useMemo(
    () => barbers.filter((barber) => barber.coordinates.lat !== 0 && barber.coordinates.lng !== 0),
    [barbers]
  );

  // Derived, not stored: an usta who disappears from a refreshed list simply
  // stops being selected, with no effect needed to clean up after them.
  const selected = markers.find((barber) => barber.id === selectedId) ?? null;

  const focusOn = (coordinates: Coordinates, zoom = 15) => {
    nonceRef.current += 1;
    setTarget({ coordinates, zoom, nonce: nonceRef.current });
  };

  const openBarber = (barber: BarberProfile) => {
    setSelectedId(barber.id);
    focusOn(barber.coordinates, 16);
  };

  return (
    <div className="relative h-[460px] w-full overflow-hidden rounded-3xl border border-white/30 shadow-[0_4px_30px_rgba(0,0,0,0.1)] sm:h-[560px]">
      <MapContainer
        center={[TASHKENT_CENTER.lat, TASHKENT_CENTER.lng]}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        {/* Bottom right, so it never sits under the search box. */}
        <ZoomControl position="bottomright" />
        <FitToMarkers barbers={markers} enabled={target === null} />
        <FlyTo target={target} />

        {markers.map((barber) => (
          <Marker
            key={barber.id}
            position={[barber.coordinates.lat, barber.coordinates.lng]}
            icon={createPinIcon({
              color: barber.avatarColor,
              label: barber.name.charAt(0).toUpperCase(),
              photo: barber.photo,
              active: selected?.id === barber.id,
            })}
            eventHandlers={{ click: () => openBarber(barber) }}
          />
        ))}
      </MapContainer>

      <MapSearch barbers={markers} onSelectPlace={focusOn} onSelectBarber={openBarber} />

      {selected && <BarberDetailPanel barber={selected} onClose={() => setSelectedId(null)} />}
    </div>
  );
}
