import { Ban, CheckCircle2, Pencil } from "lucide-react";
import type { ManagedBarber } from "@/lib/adminBarbers";

interface BarberRowProps {
  barber: ManagedBarber;
  onEdit: (id: string) => void;
  onToggleBlock: (id: string) => void;
}

export default function BarberRow({ barber, onEdit, onToggleBlock }: BarberRowProps) {
  const isActive = barber.status === "active";

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
          style={{ backgroundColor: barber.avatarColor }}
        >
          {barber.name.charAt(0)}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{barber.name}</p>
          <p className="truncate text-xs text-muted-foreground">{barber.specialty}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
        <span
          className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
            isActive ? "border-primary/30 bg-primary/10 text-primary" : "border-accent/30 bg-accent/10 text-accent"
          }`}
        >
          {isActive ? "Faol" : "Bloklangan"}
        </span>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => onEdit(barber.id)}
            className="btn-premium flex items-center gap-1 rounded-full border border-white/50 bg-white/30 px-3 py-1.5 text-xs font-semibold text-foreground backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/45 active:scale-95"
          >
            <Pencil size={12} />
            Tahrirlash
          </button>
          <button
            type="button"
            onClick={() => onToggleBlock(barber.id)}
            className={`btn-premium flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:shadow-md active:scale-95 ${
              isActive
                ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}
          >
            {isActive ? (
              <>
                <Ban size={12} />
                Bloklash
              </>
            ) : (
              <>
                <CheckCircle2 size={12} />
                Faollashtirish
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
