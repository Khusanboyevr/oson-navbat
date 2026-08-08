import { getUpcomingDates, isSlotBooked, TIME_SLOTS } from "@/lib/dates";

interface DateTimePickerProps {
  selectedDateIso: string;
  selectedTime: string | null;
  onSelectDate: (iso: string) => void;
  onSelectTime: (time: string) => void;
}

const UPCOMING_DAYS = 7;

export default function DateTimePicker({
  selectedDateIso,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: DateTimePickerProps) {
  const dates = getUpcomingDates(UPCOMING_DAYS);
  const selectedDateIndex = Math.max(
    0,
    dates.findIndex((date) => date.iso === selectedDateIso)
  );

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
              className={`flex shrink-0 flex-col items-center gap-0.5 rounded-2xl border px-4 py-2.5 backdrop-blur-md transition-colors ${
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

      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
        {TIME_SLOTS.map((time, slotIndex) => {
          const booked = isSlotBooked(selectedDateIndex, slotIndex);
          const isSelected = !booked && time === selectedTime;
          return (
            <button
              key={time}
              type="button"
              disabled={booked}
              onClick={() => onSelectTime(time)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium backdrop-blur-md transition-colors ${
                booked
                  ? "cursor-not-allowed border-white/30 bg-white/20 text-muted-foreground line-through"
                  : isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-white/40 bg-white/50 text-foreground hover:bg-white/70"
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
