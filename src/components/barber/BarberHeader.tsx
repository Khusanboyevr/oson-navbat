import { Award, MapPin, Navigation, Phone, Scissors, Star } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { BarberProfile } from "@/lib/types";

interface BarberHeaderProps {
  barber: BarberProfile;
}

const CATEGORY_LABEL: Record<BarberProfile["category"], string> = {
  erkaklar: "Erkaklar",
  ayollar: "Ayollar",
  bolalar: "Bolalar",
};

/** The usta's introduction: who they are, where they are, and what they charge from. */
export default function BarberHeader({ barber }: BarberHeaderProps) {
  const cheapest = barber.services.reduce<number | null>(
    (min, service) => (min === null || service.price < min ? service.price : min),
    null
  );

  const hasCoordinates = barber.coordinates.lat !== 0 && barber.coordinates.lng !== 0;
  const directionsUrl = `https://www.openstreetmap.org/directions?to=${barber.coordinates.lat}%2C${barber.coordinates.lng}`;

  return (
    <section className="overflow-hidden rounded-3xl border border-white/30 bg-white/20 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
      {/* A colour wash drawn from the usta's own accent, so every profile feels theirs. */}
      <div
        className="h-20 w-full sm:h-24"
        style={{ background: `linear-gradient(120deg, ${barber.avatarColor}D9, ${barber.avatarColor}33 70%, transparent)` }}
      />

      <div className="flex flex-col gap-6 p-6 pt-0 sm:p-8 sm:pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-end gap-4">
            {barber.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or backend-hosted avatar
              <img
                src={barber.photo}
                alt={barber.name}
                className="-mt-12 h-24 w-24 shrink-0 rounded-3xl border-4 border-white/70 object-cover shadow-lg sm:-mt-14 sm:h-28 sm:w-28"
              />
            ) : (
              <span
                className="-mt-12 flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl border-4 border-white/70 text-4xl font-bold text-white shadow-lg sm:-mt-14 sm:h-28 sm:w-28"
                style={{ backgroundColor: barber.avatarColor }}
              >
                {barber.name.charAt(0)}
              </span>
            )}

            <div className="min-w-0 pb-1">
              <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{barber.name}</h1>
              <p className="mt-0.5 text-sm text-muted-foreground">{barber.specialty}</p>
            </div>
          </div>

          {cheapest !== null && (
            <div className="shrink-0 rounded-2xl border border-white/40 bg-white/50 px-4 py-2.5 text-right backdrop-blur-md">
              <p className="text-xs text-muted-foreground">Xizmatlar</p>
              <p className="text-sm font-bold text-foreground">{formatNumber(cheapest)} so&apos;mdan</p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-semibold text-accent">
            <Star size={13} className="fill-accent text-accent" />
            {barber.rating > 0 ? barber.rating.toFixed(1) : "Yangi usta"}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary">
            <Scissors size={13} />
            {CATEGORY_LABEL[barber.category]}
          </span>
          {barber.experienceYears > 0 && (
            <span className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/50 px-3 py-1.5 text-xs font-medium text-foreground/75">
              <Award size={13} />
              {barber.experienceYears} yil tajriba
            </span>
          )}
          <span className="flex items-center gap-1.5 rounded-full border border-white/50 bg-white/50 px-3 py-1.5 text-xs font-medium text-foreground/75">
            {barber.services.length} ta xizmat
          </span>
        </div>

        {barber.bio && <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{barber.bio}</p>}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/40 pt-4 text-sm">
          {barber.location && (
            <span className="flex items-center gap-1.5 text-muted-foreground">
              <MapPin size={15} className="shrink-0 text-primary" />
              {barber.location}
            </span>
          )}
          {barber.phone && (
            <a
              href={`tel:${barber.phone}`}
              className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-primary"
            >
              <Phone size={15} className="shrink-0 text-primary" />
              {barber.phone}
            </a>
          )}
          {hasCoordinates && (
            <a
              href={directionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 font-medium text-primary hover:underline"
            >
              <Navigation size={15} className="shrink-0" />
              Yo&apos;l ko&apos;rsatish
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
