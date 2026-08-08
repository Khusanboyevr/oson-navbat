import { Calendar, MapPin } from "lucide-react";
import Link from "next/link";
import type { Barber } from "@/lib/barbers";
import type { Booking, BookingStatus } from "@/lib/bookings";
import { formatNumber } from "@/lib/format";

interface BookingCardProps {
  booking: Booking;
  barber: Barber;
}

const STATUS_CONFIG: Record<BookingStatus, { label: string; className: string }> = {
  pending: { label: "⏳ Kutilmoqda", className: "border-accent/30 bg-accent/15 text-accent" },
  confirmed: { label: "Tasdiqlangan", className: "border-primary/30 bg-primary/15 text-primary" },
  completed: { label: "✅ Yakunlangan", className: "border-white/40 bg-white/30 text-foreground/60" },
};

export default function BookingCard({ booking, barber }: BookingCardProps) {
  const status = STATUS_CONFIG[booking.status];
  const isActive = booking.status !== "completed";

  return (
    <div className="flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/20 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25">
      <div className="flex items-start justify-between gap-3">
        <Link href={`/barber/${barber.id}`} className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white"
            style={{ backgroundColor: barber.avatarColor }}
          >
            {barber.name.charAt(0)}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-foreground">{barber.name}</h3>
            <p className="truncate text-xs text-muted-foreground">{booking.serviceName}</p>
          </div>
        </Link>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {booking.dateLabel}, {booking.time}
        </span>
        <span className="flex items-center gap-1">
          <MapPin size={14} />
          {barber.location}
        </span>
      </div>

      <div className="flex items-center justify-between border-t border-white/30 pt-4">
        <span className="text-sm font-bold text-foreground">{formatNumber(booking.price)} so&apos;m</span>

        {isActive ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded-xl border border-white/40 bg-white/25 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-colors hover:bg-white/40"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent-hover"
            >
              Yo&apos;nalish olish
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary-hover"
          >
            Baholash
          </button>
        )}
      </div>
    </div>
  );
}
