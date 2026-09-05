import { Check, Clock } from "lucide-react";
import { formatNumber } from "@/lib/format";
import type { BarberProfile } from "@/lib/types";

interface ServiceListProps {
  services: BarberProfile["services"];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export default function ServiceList({ services, selectedServiceId, onSelect }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <p className="rounded-2xl border border-white/40 bg-white/40 px-4 py-6 text-center text-sm text-muted-foreground backdrop-blur-md">
        Bu usta hali xizmat qo&apos;shmagan.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            aria-pressed={isSelected}
            className={`group flex items-center justify-between gap-4 rounded-2xl border p-4 text-left backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] active:scale-[0.98] ${
              isSelected
                ? "border-primary bg-primary/10 shadow-[0_4px_20px_rgba(20,94,229,0.18)] ring-1 ring-primary/40"
                : "border-white/40 bg-white/50 hover:bg-white/70"
            }`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200 ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-foreground/20 bg-white/70 group-hover:border-primary/50"
                }`}
              >
                {isSelected && <Check size={14} strokeWidth={3} />}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-foreground">{service.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock size={12} />
                  {service.durationMinutes} daqiqa
                </p>
              </div>
            </div>

            <span className="shrink-0 text-sm font-bold text-foreground">
              {formatNumber(service.price)} so&apos;m
            </span>
          </button>
        );
      })}
    </div>
  );
}
