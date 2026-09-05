"use client";

import { CalendarDays, Clock, Loader2, Users, Wallet } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import AdminBookingCard from "@/components/dashboard/AdminBookingCard";
import StatCard from "@/components/dashboard/StatCard";
import { formatNumber } from "@/lib/format";
import type { AppBooking, BookingStatusKey } from "@/lib/types";

/** The usta's day, read from `GET /bookings/?scope=today`. */
export default function DailySchedule() {
  const [entries, setEntries] = useState<AppBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings?scope=today", { cache: "no-store" });
      const payload = (await response.json()) as { data?: AppBooking[]; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Jadvalni yuklab bo'lmadi");
        return;
      }
      setEntries(payload.data ?? []);
      setError(null);
    } catch {
      setError("Tarmoq xatosi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    // Loading from the server on mount — setState lands after the request.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void load();
  }, [load]);

  const stats = useMemo(() => {
    const clients = entries.filter((entry) => entry.status !== "cancelled").length;
    const pending = entries.filter((entry) => entry.status === "pending").length;
    const earnings = entries
      .filter((entry) => entry.status === "completed")
      .reduce((sum, entry) => sum + entry.price, 0);
    return { clients, pending, earnings };
  }, [entries]);

  const changeStatus = async (id: string, status: Exclude<BookingStatusKey, "pending">) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        setError(payload.message ?? "Amalni bajarib bo'lmadi");
        return;
      }
      setError(null);
      await load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Bugungi jadval</h1>
        <p className="mt-1 text-sm text-muted-foreground">Mening jadvalim bo&apos;yicha bugungi holat.</p>
      </div>

      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={Users} label="Bugungi mijozlar" value={stats.clients.toString()} />
        <StatCard icon={Clock} label="Kutilayotgan" value={stats.pending.toString()} />
        <StatCard icon={Wallet} label="Bugungi daromad" value={`${formatNumber(stats.earnings)} so'm`} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-3xl border border-white/30 bg-white/30 p-8 text-sm text-muted-foreground backdrop-blur-xl">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      ) : entries.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-3xl border border-white/30 bg-white/30 p-10 text-center backdrop-blur-xl">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <CalendarDays size={26} />
          </span>
          <p className="text-sm font-semibold text-foreground">Bugunga bron yo&apos;q</p>
          <p className="max-w-xs text-xs text-muted-foreground">
            Yangi bron kelganda shu yerda ko&apos;rinadi va sizga xabarnoma yuboriladi.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {entries.map((entry) => (
            <AdminBookingCard
              key={entry.id}
              entry={entry}
              isBusy={busyId === entry.id}
              onConfirm={(id) => changeStatus(id, "confirmed")}
              onComplete={(id) => changeStatus(id, "completed")}
              onCancel={(id) => changeStatus(id, "cancelled")}
            />
          ))}
        </div>
      )}
    </div>
  );
}
