import { Check } from "lucide-react";
import type { Service } from "@/lib/barbers";
import { formatNumber } from "@/lib/format";

interface ServiceListProps {
  services: Service[];
  selectedServiceId: string | null;
  onSelect: (serviceId: string) => void;
}

export default function ServiceList({ services, selectedServiceId, onSelect }: ServiceListProps) {
  return (
    <div className="flex flex-col gap-3">
      {services.map((service) => {
        const isSelected = service.id === selectedServiceId;
        return (
          <button
            key={service.id}
            type="button"
            onClick={() => onSelect(service.id)}
            aria-pressed={isSelected}
            className={`flex items-center justify-between gap-4 rounded-2xl border p-4 text-left backdrop-blur-md transition-colors ${
              isSelected ? "border-primary bg-primary/10" : "border-white/40 bg-white/50 hover:bg-white/70"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                  isSelected ? "border-primary bg-primary text-primary-foreground" : "border-border bg-white/70"
                }`}
              >
                {isSelected && <Check size={14} />}
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">{service.name}</p>
                <p className="text-xs text-muted-foreground">{service.durationMinutes} daqiqa</p>
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
