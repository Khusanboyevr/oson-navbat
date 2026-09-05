import { CalendarDays, Clock, Scissors } from "lucide-react";
import { formatDateLabel } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { BarberProfile } from "@/lib/types";

interface BookingSummaryProps {
  barber: BarberProfile;
  /** False for an usta the backend doesn't know yet — bookings would be rejected. */
  canBook: boolean;
  service: BarberProfile["services"][number] | null;
  dateIso: string;
  time: string | null;
  onContinue: () => void;
}

export default function BookingSummary({
  barber,
  canBook,
  service,
  dateIso,
  time,
  onContinue,
}: BookingSummaryProps) {
  const isComplete = Boolean(service && time) && canBook;
  const priceLabel = service ? `${formatNumber(service.price)} so'm` : "0 so'm";
  const dateLabel = formatDateLabel(dateIso);

  /** What's still missing, so the button never just sits there disabled without a reason. */
  const hint = !canBook
    ? "Bron vaqtincha yopiq"
    : !service
      ? "Xizmatni tanlang"
      : !time
        ? "Sana va vaqtni tanlang"
        : null;

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/25 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <div className="flex items-center gap-3 border-b border-white/40 pb-4">
            {barber.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or backend-hosted avatar
              <img src={barber.photo} alt="" className="h-11 w-11 shrink-0 rounded-xl object-cover" />
            ) : (
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white"
                style={{ backgroundColor: barber.avatarColor }}
              >
                {barber.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{barber.name}</p>
              <p className="truncate text-xs text-muted-foreground">Bron tafsilotlari</p>
            </div>
          </div>

          <div className="flex flex-col gap-3 text-sm">
            <SummaryRow icon={Scissors} label="Xizmat" value={service?.name ?? "Tanlanmagan"} />
            <SummaryRow icon={CalendarDays} label="Sana" value={time ? dateLabel : "Tanlanmagan"} />
            <SummaryRow icon={Clock} label="Vaqt" value={time ?? "Tanlanmagan"} />
            {service && (
              <SummaryRow icon={Clock} label="Davomiyligi" value={`${service.durationMinutes} daqiqa`} />
            )}
          </div>

          <div className="flex items-center justify-between border-t border-white/40 pt-4">
            <span className="text-sm text-muted-foreground">Jami narx</span>
            <span className="text-xl font-bold text-foreground">{priceLabel}</span>
          </div>

          <button
            type="button"
            onClick={onContinue}
            disabled={!isComplete}
            className="btn-premium w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_4px_16px_rgba(4,20,73,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-[0_8px_24px_rgba(4,20,73,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Davom etish
          </button>

          {hint && <p className="text-center text-xs text-muted-foreground">{hint}</p>}
        </div>
      </aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/80 px-4 py-3 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">
              {service?.name ?? "Xizmatni tanlang"}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {time ? `${dateLabel}, ${time} • ${priceLabel}` : (hint ?? "")}
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={!isComplete}
            className="btn-premium shrink-0 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_4px_16px_rgba(4,20,73,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-[0_8px_24px_rgba(4,20,73,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0"
          >
            Davom etish
          </button>
        </div>
      </div>
    </>
  );
}

function SummaryRow({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="flex items-center gap-1.5 text-muted-foreground">
        <Icon size={14} />
        {label}
      </span>
      <span className="min-w-0 truncate text-right font-medium text-foreground">{value}</span>
    </div>
  );
}
