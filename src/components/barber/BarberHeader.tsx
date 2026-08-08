import { MapPin, Star } from "lucide-react";
import type { Barber } from "@/lib/barbers";

interface BarberHeaderProps {
  barber: Barber;
}

export default function BarberHeader({ barber }: BarberHeaderProps) {
  return (
    <section className="flex flex-col gap-6 rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:flex-row sm:items-center sm:p-8">
      <div
        className="flex h-24 w-24 shrink-0 items-center justify-center rounded-3xl text-4xl font-bold text-white"
        style={{ backgroundColor: barber.avatarColor }}
      >
        {barber.name.charAt(0)}
      </div>

      <div className="flex flex-col gap-2">
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">{barber.name}</h1>
        <p className="text-sm text-muted-foreground">{barber.specialty}</p>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="flex items-center gap-1 font-semibold text-foreground">
            <Star size={16} className="fill-accent text-accent" />
            {barber.rating.toFixed(1)}
          </span>
          <span className="flex items-center gap-1 text-muted-foreground">
            <MapPin size={16} />
            {barber.location}
          </span>
        </div>

        <p className="max-w-xl text-sm text-muted-foreground">{barber.bio}</p>
      </div>
    </section>
  );
}
