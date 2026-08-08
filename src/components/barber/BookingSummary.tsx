import { formatDateLabel } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { Service } from "@/lib/barbers";

interface BookingSummaryProps {
  service: Service | null;
  dateIso: string;
  time: string | null;
  onContinue: () => void;
}

export default function BookingSummary({ service, dateIso, time, onContinue }: BookingSummaryProps) {
  const isComplete = Boolean(service && time);
  const priceLabel = service ? `${formatNumber(service.price)} so'm` : "0 so'm";
  const dateLabel = formatDateLabel(dateIso);

  return (
    <>
      <aside className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-4 rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_4px_30px_rgba(0,0,0,0.1)] backdrop-blur-xl">
          <h3 className="text-lg font-bold text-foreground">Bron tafsilotlari</h3>

          <div className="flex flex-col gap-3 text-sm">
            <SummaryRow label="Xizmat" value={service?.name ?? "Tanlanmagan"} />
            <SummaryRow label="Sana" value={time ? dateLabel : "Tanlanmagan"} />
            <SummaryRow label="Vaqt" value={time ?? "Tanlanmagan"} />
          </div>

          <div className="flex items-center justify-between border-t border-white/40 pt-4">
            <span className="text-sm text-muted-foreground">Jami narx</span>
            <span className="text-xl font-bold text-foreground">{priceLabel}</span>
          </div>

          <button
            type="button"
            onClick={onContinue}
            disabled={!isComplete}
            className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Davom etish
          </button>
        </div>
      </aside>

      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/40 bg-white/70 px-4 py-3 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.75rem)" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground">{service?.name ?? "Xizmatni tanlang"}</p>
            <p className="truncate text-xs text-muted-foreground">
              {time ? `${dateLabel}, ${time} • ${priceLabel}` : "Sana va vaqtni tanlang"}
            </p>
          </div>
          <button
            type="button"
            onClick={onContinue}
            disabled={!isComplete}
            className="shrink-0 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-md active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            Davom etish
          </button>
        </div>
      </div>
    </>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}
