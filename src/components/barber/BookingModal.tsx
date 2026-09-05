"use client";

import { Check, Loader2, LogIn, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { formatDateLabel } from "@/lib/dates";
import { formatNumber } from "@/lib/format";
import type { BarberProfile } from "@/lib/types";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  barber: BarberProfile;
  service: BarberProfile["services"][number];
  dateIso: string;
  time: string;
}

/**
 * Booking confirmation.
 *
 * The customer is already identified by their Google account, so this asks for
 * nothing — no phone number, no SMS code. The booking is created on the backend
 * and a failure is shown as the backend described it, never swallowed behind a
 * success screen.
 */
export default function BookingModal({
  isOpen,
  onClose,
  barber,
  service,
  dateIso,
  time,
}: BookingModalProps) {
  const { user, isLoading } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barberId: barber.id,
          serviceId: service.id,
          date: dateIso,
          time,
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as { message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Bronni saqlab bo'lmadi, qaytadan urinib ko'ring");
        return;
      }
      setIsDone(true);
    } catch {
      setError("Tarmoq xatosi — internetni tekshiring");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Modalni yopish"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in bg-foreground/30 backdrop-blur-md"
      />

      <div className="relative z-10 w-full max-w-sm animate-modal-in rounded-3xl border border-white/30 bg-white/20 p-6 shadow-[0_8px_40px_rgba(0,0,0,0.18)] backdrop-blur-2xl sm:p-8">
        <button
          type="button"
          aria-label="Yopish"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-white/30 text-foreground/70 backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/50 hover:text-foreground active:scale-90"
        >
          <X size={16} />
        </button>

        {!isDone && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Bronni tasdiqlang</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {user ? `${user.name} nomidan band qilinadi.` : "Davom etish uchun hisobingizga kiring."}
              </p>
            </div>

            <p className="rounded-xl border border-white/30 bg-white/25 px-4 py-2.5 text-xs text-muted-foreground backdrop-blur-md">
              {barber.name} • {service.name} • {formatDateLabel(dateIso)}, {time} •{" "}
              {formatNumber(service.price)} so&apos;m
            </p>

            {error && (
              <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2.5 text-center text-xs text-danger">
                {error}
              </p>
            )}

            {isLoading ? (
              <span className="flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground">
                <Loader2 size={16} className="animate-spin" />
                Yuklanmoqda...
              </span>
            ) : user ? (
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
                className="btn-premium flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground shadow-[0_4px_16px_rgba(4,20,73,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-accent-hover hover:shadow-[0_8px_24px_rgba(4,20,73,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                {isSubmitting ? "Band qilinmoqda..." : "Tasdiqlash"}
              </button>
            ) : (
              <Link
                href="/login"
                className="btn-premium flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
              >
                <LogIn size={16} />
                Google orqali kirish
              </Link>
            )}
          </div>
        )}

        {isDone && (
          <div className="flex flex-col items-center gap-4 text-center">
            <span className="flex h-20 w-20 animate-check-pop items-center justify-center rounded-full bg-primary/15 text-primary">
              <Check size={40} strokeWidth={3} />
            </span>
            <div>
              <h2 className="font-serif text-xl font-bold text-foreground">Muvaffaqiyatli band qilindi!</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Sizning navbatingiz tasdiqlandi. Tashrifingizdan 1 soat oldin eslatma yuboramiz.
              </p>
            </div>

            <div className="flex w-full flex-col gap-2">
              <Link
                href="/bookings"
                onClick={onClose}
                className="btn-premium w-full rounded-full bg-primary px-5 py-3 text-center text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
              >
                Bronlarimga o&apos;tish
              </Link>
              <Link
                href="/"
                onClick={onClose}
                className="btn-premium w-full rounded-full border border-white/50 bg-white/25 px-5 py-3 text-center text-sm font-semibold text-foreground shadow-[0_4px_16px_rgba(0,0,0,0.08)] backdrop-blur-md transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-white/40 hover:shadow-[0_8px_24px_rgba(0,0,0,0.12)] active:scale-95"
              >
                Asosiy sahifaga qaytish
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
