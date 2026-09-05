"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getUpcomingDates, TIME_SLOTS } from "@/lib/dates";

interface DateTimePickerProps {
  barberId: string;
  serviceId: string | null;
  selectedDateIso: string;
  selectedTime: string | null;
  onSelectDate: (iso: string) => void;
  onSelectTime: (time: string) => void;
}

const UPCOMING_DAYS = 7;

export default function DateTimePicker({
  barberId,
  serviceId,
  selectedDateIso,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: DateTimePickerProps) {
  const dates = getUpcomingDates(UPCOMING_DAYS);
  /** `null` means the backend couldn't tell us — then every slot is offered. */
  const [available, setAvailable] = useState<string[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsLoading(true);

    const query = new URLSearchParams({ barber: barberId, date: selectedDateIso });
    if (serviceId) query.set("service", serviceId);

    fetch(`/api/bookings/slots?${query.toString()}`, { signal: controller.signal, cache: "no-store" })
      .then((response) => response.json() as Promise<{ data?: { available: string[] | null } }>)
      .then((payload) => {
        if (controller.signal.aborted) return;
        setAvailable(payload.data?.available ?? null);
      })
      .catch(() => {
        if (!controller.signal.aborted) setAvailable(null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [barberId, serviceId, selectedDateIso]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {dates.map((date) => {
          const isSelected = date.iso === selectedDateIso;
          return (
            <button
              key={date.iso}
              type="button"
              onClick={() => onSelectDate(date.iso)}
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-4 py-2.5 backdrop-blur-md transition-all duration-200 ease-in-out active:scale-95 ${
                isSelected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/40 bg-white/50 text-foreground hover:bg-white/70"
              }`}
            >
              <span className="text-xs font-medium">{date.shortLabel}</span>
              <span className="text-sm font-bold">
                {date.dayNumber} {date.monthLabel}
              </span>
            </button>
          );
        })}
      </div>

      {isLoading && (
        <p className="flex items-center gap-2 text-xs text-muted-foreground">
          <Loader2 size={13} className="animate-spin" />
          Bo&apos;sh vaqtlar tekshirilmoqda...
        </p>
      )}

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {TIME_SLOTS.map((time) => {
          const taken = available !== null && !available.includes(time);
          const isSelected = !taken && time === selectedTime;
          return (
            <button
              key={time}
              type="button"
              disabled={taken}
              onClick={() => onSelectTime(time)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium backdrop-blur-md transition-all duration-200 ease-in-out ${
                taken
                  ? "cursor-not-allowed border-white/30 bg-white/20 text-muted-foreground line-through"
                  : isSelected
                    ? "border-primary bg-primary text-primary-foreground hover:-translate-y-[1px] active:scale-95"
                    : "border-white/40 bg-white/50 text-foreground hover:-translate-y-[1px] hover:bg-white/70 active:scale-95"
              }`}
            >
              {time}
            </button>
          );
        })}
      </div>
    </div>
  );
}
