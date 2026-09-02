"use client";

import { Ban, CheckCircle2, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AddBarberModal from "@/components/dashboard/AddBarberModal";
import type { BarberProfile } from "@/lib/types";

/**
 * The super admin's worker list — add, block/unblock and delete. Rows served by
 * the Django backend are marked and left read-only, since this app isn't their
 * owner.
 */
export default function BarberManagement() {
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/barbers", { cache: "no-store" });
      const payload = (await response.json()) as { data?: BarberProfile[]; message?: string };
      if (!response.ok) {
        setError(payload.message ?? "Ustalarni yuklab bo'lmadi");
        return;
      }
      setBarbers(payload.data ?? []);
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

  const mutate = async (id: string, init: RequestInit) => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/barbers/${id}`, init);
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
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Ustalar ro&apos;yxati</h2>
          <p className="text-xs text-muted-foreground">
            Bu yerdagi har bir faol usta bosh sahifadagi xaritada ko&apos;rinadi.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsModalOpen(true)}
          className="btn-premium flex items-center gap-1.5 rounded-full bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-[0_4px_16px_rgba(20,94,229,0.35)] transition-all duration-200 ease-in-out hover:-translate-y-[1px] hover:bg-primary-hover hover:shadow-[0_8px_24px_rgba(20,94,229,0.45)] active:scale-95"
        >
          <Plus size={16} />
          Yangi usta qo&apos;shish
        </button>
      </div>

      {error && (
        <p className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/20 p-8 text-sm text-muted-foreground backdrop-blur-xl">
          <Loader2 size={16} className="animate-spin" />
          Yuklanmoqda...
        </div>
      ) : barbers.length === 0 ? (
        <div className="rounded-2xl border border-white/30 bg-white/20 p-8 text-center text-sm text-muted-foreground backdrop-blur-xl">
          Hozircha usta yo&apos;q.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {barbers.map((barber) => {
            const isActive = barber.status === "active";
            const isBusy = busyId === barber.id;
            const isBackendOwned = barber.source === "backend";

            return (
              <div
                key={barber.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="flex min-w-0 items-center gap-3">
                  {barber.photo ? (
                    // eslint-disable-next-line @next/next/no-img-element -- data URL or backend-hosted avatar
                    <img src={barber.photo} alt="" className="h-11 w-11 rounded-xl object-cover" />
                  ) : (
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-sm font-semibold text-white"
                      style={{ backgroundColor: barber.avatarColor }}
                    >
                      {barber.name.charAt(0)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{barber.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{barber.specialty}</p>
                    <p className="flex items-center gap-1 truncate text-[11px] text-muted-foreground">
                      <MapPin size={11} className="text-primary" />
                      {barber.location}
                      {isBackendOwned && " • backend"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span
                    className={`shrink-0 rounded-full border px-3 py-1 text-xs font-medium ${
                      isActive
                        ? "border-primary/30 bg-primary/10 text-primary"
                        : "border-accent/30 bg-accent/10 text-accent"
                    }`}
                  >
                    {isActive ? "Faol" : "Bloklangan"}
                  </span>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy || isBackendOwned}
                      title={isBackendOwned ? "Backend boshqaradi" : undefined}
                      onClick={() =>
                        mutate(barber.id, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: isActive ? "blocked" : "active" }),
                        })
                      }
                      className={`btn-premium flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-200 ease-in-out hover:-translate-y-[1px] active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                        isActive
                          ? "bg-accent text-accent-foreground hover:bg-accent-hover"
                          : "bg-primary text-primary-foreground hover:bg-primary-hover"
                      }`}
                    >
                      {isBusy ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : isActive ? (
                        <Ban size={12} />
                      ) : (
                        <CheckCircle2 size={12} />
                      )}
                      {isActive ? "Bloklash" : "Faollashtirish"}
                    </button>

                    <button
                      type="button"
                      disabled={isBusy || isBackendOwned}
                      onClick={() => mutate(barber.id, { method: "DELETE" })}
                      aria-label="Ustani o'chirish"
                      className="btn-premium flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isModalOpen && (
        <AddBarberModal
          onClose={() => setIsModalOpen(false)}
          onSaved={() => {
            void load();
          }}
        />
      )}
    </section>
  );
}
