import { MapPin, Star } from "lucide-react";
import Link from "next/link";
import type { Barber } from "@/lib/barbers";

interface BarberCardProps {
  barber: Barber;
}

export default function BarberCard({ barber }: BarberCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/20 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/30 hover:shadow-[0_8px_40px_rgba(0,0,0,0.15)]">
      <div className="flex items-center gap-3">
        <div
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white"
          style={{ backgroundColor: barber.avatarColor }}
        >
          {barber.name.charAt(0)}
        </div>
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-foreground">{barber.name}</h3>
          <p className="truncate text-xs text-muted-foreground">{barber.specialty}</p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="flex items-center gap-1 font-medium text-foreground">
          <Star size={14} className="fill-accent text-accent" />
          {barber.rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <MapPin size={14} />
          {barber.location}
        </span>
      </div>

      <Link
        href={`/barber/${barber.id}`}
        className="mt-1 flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-md active:scale-95"
      >
        Bron qilish
      </Link>
    </div>
  );
}
