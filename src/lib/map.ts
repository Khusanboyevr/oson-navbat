import type { Coordinates } from "@/lib/types";

/**
 * Map configuration.
 *
 * The app uses Leaflet with OpenStreetMap tiles: no API key, no account, no quota
 * to babysit — which is why it replaced the Yandex integration that needed a key
 * the project never had. Everything below is the little we actually need from it.
 */

export const TASHKENT_CENTER: Coordinates = { lat: 41.2995, lng: 69.2401 };

export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

export const DEFAULT_ZOOM = 11;
export const PICKER_ZOOM = 15;

/** OSM's free reverse geocoder — used to prefill the address once a pin is dropped. */
export async function reverseGeocode(coordinates: Coordinates): Promise<string | null> {
  try {
    const url = new URL("https://nominatim.openstreetmap.org/reverse");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("lat", String(coordinates.lat));
    url.searchParams.set("lon", String(coordinates.lng));
    url.searchParams.set("accept-language", "uz");

    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) return null;

    const data = (await response.json()) as { display_name?: string };
    return data.display_name ?? null;
  } catch {
    return null;
  }
}
