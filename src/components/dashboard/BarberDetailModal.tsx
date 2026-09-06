"use client";

import {
  Ban,
  Briefcase,
  CalendarDays,
  CheckCircle2,
  Clock,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/format";
import type { BarberProfile } from "@/lib/types";

interface BarberDetailModalProps {
  barber: BarberProfile;
  isBusy: boolean;
  onClose: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

const CATEGORY_LABELS: Record<BarberProfile["category"], string> = {
  erkaklar: "Erkaklar",
  ayollar: "Ayollar",
  bolalar: "Bolalar",
};

const MONTHS = [
  "yanvar",
  "fevral",
  "mart",
  "aprel",
  "may",
  "iyun",
  "iyul",
  "avgust",
  "sentabr",
  "oktabr",
  "noyabr",
  "dekabr",
];

/**
 * Spelled out by hand rather than through `toLocaleDateString("uz-UZ")`: browsers
 * without Uzbek locale data fall back to "2026 M04 11", and Node's data differs
 * from theirs — the same reason `formatNumber` exists.
 */
function formatDate(iso: string): string {
  const date = new Date(iso);
  if (!iso || Number.isNaN(date.getTime())) return "—";
  return `${date.getDate()}-${MONTHS[date.getMonth()]}, ${date.getFullYear()}`;
}

function Field({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-2xl border border-white/40 bg-white/40 px-3.5 py-3">
      <span className="mt-0.5 shrink-0 text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="break-words text-sm font-medium text-foreground">{value || "—"}</p>
      </div>
    </div>
  );
}

/**
 * Everything the super admin needs to judge one usta: who they are, where they
 * work, how to reach them, and what they charge — plus the two decisions that
 * can only be made once you've read it, blocking and deleting.
 */
export default function BarberDetailModal({
  barber,
  isBusy,
  onClose,
  onToggleStatus,
  onDelete,
}: BarberDetailModalProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const isActive = barber.status === "active";

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto p-4 py-8 sm:py-10">
      <button
        type="button"
        aria-label="Modalni yopish"
        onClick={onClose}
        className="fixed inset-0 animate-fade-in bg-foreground/30 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-xl animate-modal-in rounded-3xl border border-white/30 bg-white/25 p-5 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-7">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            {barber.photo ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or backend-hosted avatar
              <img src={barber.photo} alt="" className="h-14 w-14 shrink-0 rounded-2xl object-cover" />
            ) : (
              <span
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-lg font-semibold text-white"
                style={{ backgroundColor: barber.avatarColor }}
              >
                {barber.name.charAt(0)}
              </span>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-serif text-xl font-bold text-foreground">{barber.name}</h2>
              <p className="truncate text-sm text-muted-foreground">{barber.specialty}</p>
              <span
                className={`mt-1 inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${
                  isActive
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-accent/30 bg-accent/10 text-accent"
                }`}
              >
                {isActive ? "Faol" : "Bloklangan"}
              </span>
            </div>
          </div>
          <button
            type="button"
            aria-label="Yopish"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/30 text-foreground/70 backdrop-blur-md transition-all duration-200 hover:bg-white/50 active:scale-90"
          >
            <X size={16} />
          </button>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2">
          <Field icon={<Phone size={15} />} label="Telefon" value={barber.phone} />
          <Field icon={<Mail size={15} />} label="Email" value={barber.email} />
          <Field icon={<MapPin size={15} />} label="Ish joyi" value={barber.location} />
          <Field
            icon={<Briefcase size={15} />}
            label="Yo'nalish"
            value={`${CATEGORY_LABELS[barber.category]} • ${barber.experienceYears} yil tajriba`}
          />
          <Field icon={<Star size={15} />} label="Reyting" value={barber.rating ? barber.rating.toFixed(1) : "—"} />
          <Field icon={<CalendarDays size={15} />} label="Qo'shilgan" value={formatDate(barber.createdAt)} />
        </div>

        {barber.bio && (
          <p className="mt-3 rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm leading-relaxed text-foreground/80">
            {barber.bio}
          </p>
        )}

        <div className="mt-4">
          <p className="mb-2 text-sm font-semibold text-foreground">
            Xizmatlar
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">({barber.services.length} ta)</span>
          </p>
          {barber.services.length === 0 ? (
            <p className="rounded-2xl border border-white/40 bg-white/40 px-4 py-3 text-sm text-muted-foreground">
              Xizmatlar kiritilmagan.
            </p>
          ) : (
            <ul className="flex flex-col gap-2">
              {barber.services.map((service) => (
                <li
                  key={service.id}
                  className="flex items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/40 px-4 py-2.5"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium text-foreground">{service.name}</span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      {service.durationMinutes} daqiqa
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-bold text-foreground">
                    {formatNumber(service.price)} so&apos;m
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2 border-t border-white/30 pt-4 sm:flex-row">
          <button
            type="button"
            disabled={isBusy}
            onClick={onToggleStatus}
            className={`btn-premium flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold transition-all duration-200 ease-in-out hover:-translate-y-[1px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
              isActive
                ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                : "bg-primary text-primary-foreground hover:bg-primary-hover"
            }`}
          >
            {isBusy ? (
              <Loader2 size={14} className="animate-spin" />
            ) : isActive ? (
              <Ban size={14} />
            ) : (
              <CheckCircle2 size={14} />
            )}
            {isActive ? "Bloklash" : "Faollashtirish"}
          </button>

          {confirmDelete ? (
            <div className="flex flex-1 items-center gap-2">
              <button
                type="button"
                disabled={isBusy}
                onClick={onDelete}
                className="btn-premium h-11 flex-1 rounded-full bg-danger text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-[1px] active:scale-95 disabled:opacity-40"
              >
                Ha, o&apos;chirilsin
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="h-11 rounded-full border border-white/50 bg-white/40 px-4 text-sm font-medium text-foreground transition-all duration-200 hover:bg-white/60 active:scale-95"
              >
                Bekor
              </button>
            </div>
          ) : (
            <button
              type="button"
              disabled={isBusy}
              onClick={() => setConfirmDelete(true)}
              className="btn-premium flex h-11 flex-1 items-center justify-center gap-1.5 rounded-full bg-danger/10 text-sm font-semibold text-danger transition-all duration-200 hover:-translate-y-[1px] hover:bg-danger/20 active:scale-95 disabled:opacity-40"
            >
              <Trash2 size={14} />
              O&apos;chirish
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
