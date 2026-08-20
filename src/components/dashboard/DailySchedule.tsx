"use client";

import { Clock, Users, Wallet } from "lucide-react";
import { useMemo, useState } from "react";
import AdminBookingCard from "@/components/dashboard/AdminBookingCard";
import StatCard from "@/components/dashboard/StatCard";
import { useNotifications } from "@/components/providers/NotificationsProvider";
import { formatNumber } from "@/lib/format";
import type { ScheduleEntry, ScheduleStatus } from "@/lib/schedule";

interface DailyScheduleProps {
  initialEntries: ScheduleEntry[];
}

function updateStatus(entries: ScheduleEntry[], id: string, status: ScheduleStatus): ScheduleEntry[] {
  return entries.map((entry) => (entry.id === id ? { ...entry, status } : entry));
}

export default function DailySchedule({ initialEntries }: DailyScheduleProps) {
  const [entries, setEntries] = useState<ScheduleEntry[]>(initialEntries);
  const { addNotification } = useNotifications();

  const stats = useMemo(() => {
    const clients = entries.filter((entry) => entry.status !== "cancelled").length;
    const pending = entries.filter((entry) => entry.status === "pending").length;
    const earnings = entries
      .filter((entry) => entry.status === "completed")
      .reduce((sum, entry) => sum + entry.price, 0);
    return { clients, pending, earnings };
  }, [entries]);

  const handleConfirm = (id: string) => setEntries((prev) => updateStatus(prev, id, "confirmed"));
  const handleComplete = (id: string) => setEntries((prev) => updateStatus(prev, id, "completed"));

  const handleCancel = (id: string) => {
    setEntries((prev) => updateStatus(prev, id, "cancelled"));

    const entry = entries.find((item) => item.id === id);
    if (!entry) return;

    const payload = {
      title: "Navbat bekor qilindi",
      body: "Ustaning ishi chiqqanligi sababli navbat bekor qilindi. Boshqa vaqt tanlang.",
      url: "/bookings",
      tag: `cancellation-${id}`,
    };

    addNotification({ kind: "cancellation", ...payload });
    fetch("/api/push/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).catch(() => {});
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-foreground sm:text-3xl">Bugungi jadval</h1>
        <p className="mt-1 text-sm text-muted-foreground">Mening jadvalim bo&apos;yicha bugungi holat.</p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <StatCard icon={Users} label="Bugungi mijozlar" value={stats.clients.toString()} />
        <StatCard icon={Clock} label="Kutilayotgan" value={stats.pending.toString()} />
        <StatCard icon={Wallet} label="Bugungi daromad" value={`${formatNumber(stats.earnings)} so'm`} />
      </div>

      <div className="flex flex-col gap-4">
        {entries.map((entry) => (
          <AdminBookingCard
            key={entry.id}
            entry={entry}
            onConfirm={handleConfirm}
            onCancel={handleCancel}
            onComplete={handleComplete}
          />
        ))}
      </div>
    </div>
  );
}
