"use client";

import { Loader2, MapPin, Scissors, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { searchPlaces, type PlaceResult } from "@/lib/map";
import type { BarberProfile, Coordinates } from "@/lib/types";

interface MapSearchProps {
  barbers: BarberProfile[];
  onSelectPlace: (coordinates: Coordinates, zoom?: number) => void;
  onSelectBarber: (barber: BarberProfile) => void;
}

/** Nominatim asks for at most one request per second; this keeps us well under. */
const DEBOUNCE_MS = 450;
const MIN_QUERY = 3;

export default function MapSearch({ barbers, onSelectPlace, onSelectBarber }: MapSearchProps) {
  const [query, setQuery] = useState("");
  const [places, setPlaces] = useState<PlaceResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const normalized = query.trim().toLowerCase();

  // Ustas are matched locally — no round trip needed for what's already loaded.
  const matchedBarbers =
    normalized.length > 0
      ? barbers
          .filter(
            (barber) =>
              barber.name.toLowerCase().includes(normalized) ||
              barber.specialty.toLowerCase().includes(normalized) ||
              barber.location.toLowerCase().includes(normalized)
          )
          .slice(0, 4)
      : [];

  // Debounced place lookup: a request to an external service, with its result
  // landing in state through the callback — the sanctioned effect shape.
  useEffect(() => {
    if (normalized.length < MIN_QUERY) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPlaces([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    const timer = window.setTimeout(async () => {
      const results = await searchPlaces(normalized, controller.signal);
      if (controller.signal.aborted) return;
      setPlaces(results);
      setIsSearching(false);
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [normalized]);

  // Clicking anywhere else closes the suggestions.
  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const hasResults = matchedBarbers.length > 0 || places.length > 0;
  const showPanel = isOpen && normalized.length > 0;

  return (
    <div
      ref={containerRef}
      className="absolute left-3 right-3 top-3 z-[1000] sm:left-4 sm:top-4 sm:right-auto sm:w-80"
    >
      <div className="flex items-center gap-2 rounded-2xl border border-white/50 bg-white/80 px-3.5 py-2.5 shadow-[0_6px_24px_rgba(0,0,0,0.14)] backdrop-blur-xl">
        <Search size={16} className="shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          type="search"
          placeholder="Joy yoki usta qidiring..."
          aria-label="Xaritadan qidirish"
          className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
        />
        {isSearching && <Loader2 size={14} className="shrink-0 animate-spin text-muted-foreground" />}
        {query && !isSearching && (
          <button
            type="button"
            aria-label="Tozalash"
            onClick={() => {
              setQuery("");
              setPlaces([]);
            }}
            className="shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {showPanel && (
        <div className="mt-2 max-h-[300px] overflow-y-auto rounded-2xl border border-white/50 bg-white/90 p-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.16)] backdrop-blur-xl">
          {matchedBarbers.length > 0 && (
            <>
              <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Ustalar
              </p>
              {matchedBarbers.map((barber) => (
                <button
                  key={barber.id}
                  type="button"
                  onClick={() => {
                    onSelectBarber(barber);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 hover:bg-primary/10"
                >
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ backgroundColor: barber.avatarColor }}
                  >
                    <Scissors size={13} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{barber.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">{barber.location}</span>
                  </span>
                </button>
              ))}
            </>
          )}

          {places.length > 0 && (
            <>
              <p className="px-2.5 py-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Joylar
              </p>
              {places.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => {
                    onSelectPlace(place.coordinates, 15);
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-150 hover:bg-primary/10"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/70 text-primary">
                    <MapPin size={14} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{place.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{place.label}</span>
                  </span>
                </button>
              ))}
            </>
          )}

          {!hasResults && !isSearching && (
            <p className="px-2.5 py-3 text-center text-xs text-muted-foreground">
              {normalized.length < MIN_QUERY
                ? `Kamida ${MIN_QUERY} ta harf kiriting`
                : "Hech narsa topilmadi"}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
