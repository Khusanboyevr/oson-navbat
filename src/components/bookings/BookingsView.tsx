"use client";

import { CalendarClock, History, Loader2, LogIn } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import BookingTabs, { type BookingTab } from "@/components/bookings/BookingTabs";
import ScreenPlaceholder from "@/components/layout/ScreenPlaceholder";
import { useSession } from "@/components/providers/SessionProvider";
import BookingCard from "@/components/bookings/BookingCard";
import type { AppBooking } from "@/lib/types";

/** The customer's own bookings, read from the backend. */
export default function BookingsView() {
  const { user, isLoading: isSessionLoading } = useSession();
  const [bookings, setBookings] = useState<AppBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<BookingTab>("faol");

  const load = useCallback(async () => {
    if (!user) {
      setBookings([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/bookings", { cache: "no-store" });
      const payload = (await response.json()) as { data?: AppBooking[]; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Bronlarni yuklab bo'lmadi");
        return;
      }
      setBookings(payload.data ?? []);
      setError(null);
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    // Loading from the server once the session is known.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const handleCancel = async (id: string) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "cancelled" }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        setError(payload.message ?? "Bronni bekor qilib bo'lmadi");
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (isSessionLoading || isLoading) {
    return (
      <div className="flex items-center justify-center gap-2 py-24 text-sm text-muted-foreground">
        <Loader2 size={16} className="animate-spin" />
        Yuklanmoqda...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center gap-4 py-24 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
          <CalendarClock size={28} />
        </span>
        <div>
          <h1 className="font-serif text-xl font-bold text-foreground">Bronlaringizni ko&apos;rish uchun kiring</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Google hisobingiz orqali kirsangiz, barcha bronlaringiz shu yerda turadi.
          </p>
        </div>
        <Link
          href="/login"
          className="btn-premium flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-primary-hover active:scale-95"
        >
          <LogIn size={16} />
          Kirish
        </Link>
      </div>
    );
  }

  const filtered = bookings.filter((booking) =>
    tab === "faol"
      ? booking.status === "pending" || booking.status === "confirmed"
      : booking.status !== "pending" && booking.status !== "confirmed"
  );

  return (
    <div className="flex flex-col gap-6 py-8 sm:py-12">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Mening bronlarim</h1>
        <p className="mt-1 text-sm text-muted-foreground">Faol va o&apos;tgan navbatlaringiz.</p>
      </div>

      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <BookingTabs tab={tab} onChange={setTab} />

      {filtered.length === 0 ? (
        <ScreenPlaceholder
          icon={tab === "faol" ? CalendarClock : History}
          title={tab === "faol" ? "Faol bron yo'q" : "Tarix bo'sh"}
          description={
            tab === "faol"
              ? "Usta tanlab, bir necha soniyada navbat oling."
              : "Yakunlangan va bekor qilingan bronlar shu yerda ko'rinadi."
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              isBusy={busyId === booking.id}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </div>
  );
}
