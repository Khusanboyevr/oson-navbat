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

export interface PlaceResult {
  id: string;
  label: string;
  /** The shorter leading part of the address, used as the result's title. */
  title: string;
  coordinates: Coordinates;
}

/**
 * Place search over OSM's free geocoder, biased to Uzbekistan.
 *
 * Nominatim asks for at most one request per second, so callers debounce and pass
 * an `AbortSignal` to drop the in-flight request when the query changes.
 */
export async function searchPlaces(query: string, signal?: AbortSignal): Promise<PlaceResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  try {
    const url = new URL("https://nominatim.openstreetmap.org/search");
    url.searchParams.set("format", "jsonv2");
    url.searchParams.set("q", trimmed);
    url.searchParams.set("limit", "5");
    url.searchParams.set("countrycodes", "uz");
    url.searchParams.set("accept-language", "uz");

    const response = await fetch(url, { headers: { Accept: "application/json" }, signal });
    if (!response.ok) return [];

    const data = (await response.json()) as {
      place_id?: number | string;
      display_name?: string;
      name?: string;
      lat?: string;
      lon?: string;
    }[];

    return data
      .filter((item) => item.lat && item.lon && item.display_name)
      .map((item, index) => ({
        id: String(item.place_id ?? index),
        label: item.display_name as string,
        title: item.name || (item.display_name as string).split(",")[0],
        coordinates: { lat: Number.parseFloat(item.lat as string), lng: Number.parseFloat(item.lon as string) },
      }));
  } catch {
    // Aborted or offline — an empty result list is the right answer either way.
    return [];
  }
}
