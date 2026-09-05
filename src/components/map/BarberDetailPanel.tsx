"use client";

import { Award, MapPin, Navigation, Phone, Star, X } from "lucide-react";
import Link from "next/link";
import { formatNumber } from "@/lib/format";
import type { BarberProfile } from "@/lib/types";

interface BarberDetailPanelProps {
  barber: BarberProfile;
  onClose: () => void;
}

const CATEGORY_LABEL: Record<BarberProfile["category"], string> = {
  erkaklar: "Erkaklar",
  ayollar: "Ayollar",
  bolalar: "Bolalar",
};

/**
 * The full profile of the usta whose pin was tapped: photo, rating, experience,
 * address, bio and the whole service menu — with "Bron qilish" pinned to the
 * bottom, so the booking call to action is always reachable no matter how long
 * the service list gets.
 *
 * A bottom sheet on phones, a floating card on the right on wider screens.
 */
export default function BarberDetailPanel({ barber, onClose }: BarberDetailPanelProps) {
  const cheapest = barber.services.reduce<number | null>(
    (min, service) => (min === null || service.price < min ? service.price : min),
    null
  );

  const directionsUrl = `https://www.openstreetmap.org/directions?to=${barber.coordinates.lat}%2C${barber.coordinates.lng}`;

  return (
    // `inset-0` gives the wrapper the map's own height, which is what the panel's
    // percentage max-height resolves against — without it the sheet grows past
    // the map on a phone.
    <div className="pointer-events-none absolute inset-0 z-[1000] flex items-end justify-end p-3 sm:items-stretch sm:p-4">
      <aside className="pointer-events-auto flex max-h-[72%] w-full flex-col overflow-hidden rounded-3xl border border-white/50 bg-white/90 shadow-[0_10px_40px_rgba(0,0,0,0.22)] backdrop-blur-2xl sm:max-h-full sm:w-[340px]">
        <header className="flex items-start gap-3 border-b border-white/50 p-4">
          {barber.photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- data URL or backend-hosted avatar
            <img
              src={barber.photo}
              alt={barber.name}
              className="h-16 w-16 shrink-0 rounded-2xl object-cover"
            />
          ) : (
            <span
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white"
              style={{ backgroundColor: barber.avatarColor }}
            >
              {barber.name.charAt(0)}
            </span>
          )}

          <div className="min-w-0 flex-1">
            <h3 className="truncate font-serif text-lg font-bold text-foreground">{barber.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{barber.specialty}</p>

            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              <span className="flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
                <Star size={11} className="fill-accent text-accent" />
                {barber.rating > 0 ? barber.rating.toFixed(1) : "Yangi usta"}
              </span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                {CATEGORY_LABEL[barber.category]}
              </span>
              {barber.experienceYears > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-white/70 px-2 py-0.5 text-[11px] font-medium text-foreground/70">
                  <Award size={11} />
                  {barber.experienceYears} yil
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/70 text-foreground/60 transition-all duration-200 hover:bg-white hover:text-foreground active:scale-90"
          >
            <X size={14} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2 text-xs text-foreground/80">
            <p className="flex items-start gap-2">
              <MapPin size={13} className="mt-0.5 shrink-0 text-primary" />
              <span>{barber.location || "Manzil ko'rsatilmagan"}</span>
            </p>
            {barber.phone && (
              <a href={`tel:${barber.phone}`} className="flex items-center gap-2 hover:text-primary">
                <Phone size={13} className="shrink-0 text-primary" />
                {barber.phone}
              </a>
            )}
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 font-medium text-primary hover:underline"
            >
              <Navigation size={13} className="shrink-0" />
              Yo&apos;l ko&apos;rsatish
            </a>
          </div>

          {barber.bio && (
            <p className="mt-3 border-t border-white/60 pt-3 text-xs leading-relaxed text-muted-foreground">
              {barber.bio}
            </p>
          )}

          {barber.services.length > 0 && (
            <div className="mt-3 border-t border-white/60 pt-3">
              <p className="mb-2 text-xs font-semibold text-foreground">Xizmatlar</p>
              <ul className="flex flex-col gap-1.5">
                {barber.services.map((service) => (
                  <li
                    key={service.id}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/60 px-3 py-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-xs font-medium text-foreground">{service.name}</span>
                      <span className="block text-[11px] text-muted-foreground">
                        {service.durationMinutes} daqiqa
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-foreground">
                      {formatNumber(service.price)} so&apos;m
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <footer className="flex items-center gap-3 border-t border-white/50 bg-white/60 p-3">
          {cheapest !== null && (
            <div className="min-w-0">
              <p className="text-[11px] text-muted-foreground">Boshlanish narxi</p>
              <p className="truncate text-sm font-bold text-foreground">{formatNumber(cheapest)} so&apos;m</p>
            </div>
          )}
          <Link
            href={`/barber/${barber.id}`}
            className="btn-premium ml-auto flex-1 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
          >
            Bron qilish
          </Link>
        </footer>
      </aside>
    </div>
  );
}
