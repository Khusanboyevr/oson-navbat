"use client";

import "leaflet/dist/leaflet.css";

import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from "react-leaflet";
import MapSearch from "@/components/map/MapSearch";
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
    <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-white/40 shadow-[0_4px_20px_rgba(0,0,0,0.08)] sm:h-[340px]">
      <MapContainer
        center={[center.lat, center.lng]}
        zoom={value ? PICKER_ZOOM : 12}
        // Wheel zoom would swallow page scrolling inside the form; +/- and
        // double-click still zoom.
        scrollWheelZoom={false}
        // The default control sits top-left, where the search box now lives.
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
        <ZoomControl position="bottomright" />
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

      {/* Searching an address drops the pin there, so nobody has to hunt for their
          own street by dragging the map around. */}
      <MapSearch
        onSelectPlace={(coordinates) => onChange(coordinates)}
        placeholder="Manzilni qidiring — masalan, Chilonzor 19-mavze"
      />
    </div>
  );
}
