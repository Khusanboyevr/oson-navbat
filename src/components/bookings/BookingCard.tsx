import { Calendar, Clock, Loader2, Scissors } from "lucide-react";
import Link from "next/link";
import { formatDateLabel } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { AppBooking, BookingStatusKey } from "@/lib/types";

interface BookingCardProps {
  booking: AppBooking;
  isBusy: boolean;
  onCancel: (id: string) => void;
}

const STATUS_CONFIG: Record<BookingStatusKey, { label: string; className: string }> = {
  pending: { label: "⏳ Kutilmoqda", className: "border-accent/30 bg-accent/15 text-accent" },
  confirmed: { label: "Tasdiqlangan", className: "border-primary/30 bg-primary/15 text-primary" },
  completed: { label: "✅ Yakunlangan", className: "border-white/40 bg-white/30 text-foreground/60" },
  cancelled: { label: "Bekor qilindi", className: "border-white/30 bg-white/15 text-foreground/40" },
};

export default function BookingCard({ booking, isBusy, onCancel }: BookingCardProps) {
  const status = STATUS_CONFIG[booking.status];
  const isActive = booking.status === "pending" || booking.status === "confirmed";

  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/20 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-300 ${
        isActive ? "hover:bg-white/25" : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        {booking.barberId ? (
          <Link href={`/barber/${booking.barberId}`} className="flex min-w-0 items-center gap-3">
            <BarberBadge name={booking.barberName} service={booking.serviceName} />
          </Link>
        ) : (
          <div className="flex min-w-0 items-center gap-3">
            <BarberBadge name={booking.barberName} service={booking.serviceName} />
          </div>
        )}

        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar size={14} />
          {booking.date ? formatDateLabel(booking.date) : "Sana ko'rsatilmagan"}
          {booking.time && `, ${booking.time}`}
        </span>
        {booking.durationMinutes > 0 && (
          <span className="flex items-center gap-1">
            <Clock size={14} />
            {booking.durationMinutes} daqiqa
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-white/30 pt-4">
        <span className="text-sm font-bold text-foreground">{formatNumber(booking.price)} so&apos;m</span>

        {isActive && (
          <button
            type="button"
            disabled={isBusy}
            onClick={() => onCancel(booking.id)}
            className="btn-premium flex items-center gap-1.5 rounded-full border border-white/50 bg-white/30 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/45 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isBusy && <Loader2 size={12} className="animate-spin" />}
            Bekor qilish
          </button>
        )}
      </div>
    </div>
  );
}

function BarberBadge({ name, service }: { name: string; service: string }) {
  return (
    <>
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary text-lg font-semibold text-primary-foreground">
        {name ? name.charAt(0) : <Scissors size={20} />}
      </div>
      <div className="min-w-0">
        <h3 className="truncate text-base font-semibold text-foreground">{name || "Usta"}</h3>
        <p className="truncate text-xs text-muted-foreground">{service}</p>
      </div>
    </>
  );
}
