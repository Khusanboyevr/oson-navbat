import { Clock, Phone } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { ScheduleEntry, ScheduleStatus } from "@/lib/schedule";

interface AdminBookingCardProps {
  entry: ScheduleEntry;
  onConfirm: (id: string) => void;
  onCancel: (id: string) => void;
  onComplete: (id: string) => void;
}

const STATUS_CONFIG: Record<ScheduleStatus, { label: string; className: string }> = {
  pending: { label: "⏳ Kutilmoqda", className: "border-accent/30 bg-accent/10 text-accent" },
  confirmed: { label: "Tasdiqlangan", className: "border-primary/30 bg-primary/10 text-primary" },
  completed: { label: "✅ Yakunlangan", className: "border-white/40 bg-white/30 text-foreground/60" },
  cancelled: { label: "Bekor qilindi", className: "border-white/30 bg-white/15 text-foreground/40" },
};

export default function AdminBookingCard({ entry, onConfirm, onCancel, onComplete }: AdminBookingCardProps) {
  const status = STATUS_CONFIG[entry.status];
  const isActive = entry.status === "pending" || entry.status === "confirmed";

  return (
    <div
      className={`flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/20 p-5 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl transition-all duration-300 ${
        isActive ? "hover:bg-white/25" : "opacity-70"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-foreground">{entry.clientName}</h3>
          <p className="flex items-center gap-1 truncate text-xs text-muted-foreground">
            <Phone size={12} />
            {entry.clientPhone}
          </p>
        </div>
        <span className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}>
          {status.label}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Clock size={14} />
          {entry.time}
        </span>
        <span>{entry.serviceName}</span>
        <span className="font-semibold text-foreground">{formatNumber(entry.price)} so&apos;m</span>
      </div>

      {isActive && (
        <div className="flex flex-wrap items-center gap-2 border-t border-white/30 pt-4">
          <button
            type="button"
            onClick={() => onConfirm(entry.id)}
            className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-md active:scale-95"
          >
            Tasdiqlash
          </button>
          <button
            type="button"
            onClick={() => onComplete(entry.id)}
            className="rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-accent-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-md active:scale-95"
          >
            Yakunlash
          </button>
          <button
            type="button"
            onClick={() => onCancel(entry.id)}
            className="rounded-xl border border-white/40 bg-white/25 px-4 py-2 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/40 active:scale-95"
          >
            Bekor qilish
          </button>
        </div>
      )}
    </div>
  );
}
