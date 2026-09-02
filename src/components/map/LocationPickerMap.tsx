"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { createPinIcon } from "@/components/map/markerIcon";
import { PICKER_ZOOM, TASHKENT_CENTER, TILE_ATTRIBUTION, TILE_URL } from "@/lib/map";
import type { Coordinates } from "@/lib/types";

interface LocationPickerMapProps {
  value: Coordinates | null;
  onChange: (coordinates: Coordinates) => void;
}

function ClickHandler({ onChange }: { onChange: (coordinates: Coordinates) => void }) {
  useMapEvents({
    click: (event) => onChange({ lat: event.latlng.lat, lng: event.latlng.lng }),
  });
  return null;
}

/** Recenters when the pin is set from outside — e.g. the "use my location" button. */
function Recenter({ value }: { value: Coordinates | null }) {
  const map = useMap();

  useEffect(() => {
    if (value) map.setView([value.lat, value.lng], Math.max(map.getZoom(), PICKER_ZOOM));
  }, [value, map]);

  return null;
}

/** Click (or drag the pin) to set the workplace location on the map. */
export default function LocationPickerMap({ value, onChange }: LocationPickerMapProps) {
  const center = value ?? TASHKENT_CENTER;

  return (
    <div className="h-[280px] w-full overflow-hidden rounded-2xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:h-[320px]">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={value ? PICKER_ZOOM : 12}
        // Wheel zoom would swallow page scrolling inside the form; +/- and
        // double-click still zoom.
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ClickHandler onChange={onChange} />
        <Recenter value={value} />

        {value && (
          <Marker
            position={[value.lat, value.lng]}
            draggable
            eventHandlers={{
              dragend: (event) => {
                const { lat, lng } = event.target.getLatLng();
                onChange({ lat, lng });
              },
            }}
            icon={createPinIcon({ color: "#145ee5", label: "•" })}
          />
        )}
      </MapContainer>
    </div>
  );
}
