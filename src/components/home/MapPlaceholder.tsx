import { Star } from "lucide-react";
import Link from "next/link";
import type { Barber } from "@/lib/barbers";

interface MapPlaceholderProps {
  barbers: Barber[];
}

const PIN_POSITIONS = [
  { top: "16%", left: "20%" },
  { top: "24%", left: "64%" },
  { top: "48%", left: "12%" },
  { top: "42%", left: "80%" },
  { top: "74%", left: "54%" },
  { top: "68%", left: "28%" },
];

export default function MapPlaceholder({ barbers }: MapPlaceholderProps) {
  const pins = barbers.slice(0, PIN_POSITIONS.length);

  return (
    <div className="relative h-[420px] w-full overflow-hidden rounded-3xl border border-white/30 bg-white/15 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl sm:h-[540px]">
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 25%, rgba(13,148,136,0.2), transparent 40%), radial-gradient(circle at 85% 15%, rgba(249,115,22,0.16), transparent 42%), radial-gradient(circle at 70% 85%, rgba(56,189,248,0.18), transparent 45%), repeating-linear-gradient(0deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 48px), repeating-linear-gradient(90deg, rgba(15,23,42,0.05) 0px, rgba(15,23,42,0.05) 1px, transparent 1px, transparent 48px)",
        }}
      />

      <span className="absolute left-4 top-4 z-10 rounded-full border border-white/40 bg-white/30 px-3 py-1.5 text-xs font-medium text-foreground/70 backdrop-blur-md">
        🗺️ Yandex Maps kaliti sozlanmagan — namuna ko&apos;rinish
      </span>

      {pins.map((barber, index) => (
        <div
          key={barber.id}
          className="absolute z-10"
          style={{ ...PIN_POSITIONS[index], transform: "translate(-50%, -50%)" }}
        >
          <Link
            href={`/barber/${barber.id}`}
            className="flex items-center gap-2 rounded-2xl border border-white/40 bg-white/30 py-2 pl-2 pr-3 shadow-[0_4px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl transition-all duration-200 ease-in-out hover:-translate-y-1 hover:bg-white/45 hover:shadow-[0_8px_40px_rgba(0,0,0,0.18)] active:scale-95"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ backgroundColor: barber.avatarColor }}
            >
              {barber.name.charAt(0)}
            </span>
            <span className="flex flex-col">
              <span className="max-w-[6.5rem] truncate text-xs font-semibold text-foreground">{barber.name}</span>
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star size={10} className="fill-accent text-accent" />
                {barber.rating.toFixed(1)}
              </span>
            </span>
          </Link>
        </div>
      ))}
    </div>
  );
}
