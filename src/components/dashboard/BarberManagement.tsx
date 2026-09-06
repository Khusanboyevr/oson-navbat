"use client";

import { Ban, CheckCircle2, Loader2, MapPin, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import AddBarberModal from "@/components/dashboard/AddBarberModal";
import BarberDetailModal from "@/components/dashboard/BarberDetailModal";
import type { BarberProfile } from "@/lib/types";

/**
 * The super admin's worker list — open a row to read the whole profile, block or
 * unblock, and delete. Rows the Django backend owns are written through it, so
 * the same buttons work whichever side the usta was created on.
 */
export default function BarberManagement() {
  const [barbers, setBarbers] = useState<BarberProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
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

  const mutate = async (id: string, init: RequestInit): Promise<boolean> => {
    setBusyId(id);
    try {
      const response = await fetch(`/api/admin/barbers/${id}`, init);
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { message?: string };
        setError(payload.message ?? "Amalni bajarib bo'lmadi");
        return false;
      }
      setError(null);
      await load();
      return true;
    } finally {
      setBusyId(null);
    }
  };

  const toggleStatus = (barber: BarberProfile) =>
    mutate(barber.id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: barber.status === "active" ? "blocked" : "active" }),
    });

  const remove = async (id: string) => {
    const ok = await mutate(id, { method: "DELETE" });
    setConfirmDeleteId(null);
    if (ok) setOpenId(null);
  };

  const openBarber = barbers.find((barber) => barber.id === openId) ?? null;

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl font-bold text-foreground sm:text-2xl">Ustalar ro&apos;yxati</h2>
          <p className="text-xs text-muted-foreground">
            Ustani bosing — to&apos;liq ma&apos;lumotlari ochiladi. Faol ustalar bosh sahifadagi xaritada
            ko&apos;rinadi.
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
            const isConfirming = confirmDeleteId === barber.id;

            return (
              <div
                key={barber.id}
                className="flex flex-col gap-4 rounded-2xl border border-white/30 bg-white/20 p-4 shadow-[0_4px_30px_rgba(0,0,0,0.08)] backdrop-blur-xl transition-all duration-300 hover:bg-white/25 sm:flex-row sm:items-center sm:justify-between"
              >
                <button
                  type="button"
                  onClick={() => setOpenId(barber.id)}
                  className="flex min-w-0 items-center gap-3 text-left transition-transform duration-200 active:scale-[0.99]"
                >
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
                    </p>
                  </div>
                </button>

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

                  {isConfirming ? (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void remove(barber.id)}
                        className="btn-premium rounded-full bg-danger px-3 py-1.5 text-xs font-semibold text-white transition-all duration-200 active:scale-95 disabled:opacity-40"
                      >
                        {isBusy ? <Loader2 size={12} className="animate-spin" /> : "O'chirilsinmi?"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="rounded-full border border-white/50 bg-white/40 px-3 py-1.5 text-xs font-medium text-foreground transition-all duration-200 hover:bg-white/60 active:scale-95"
                      >
                        Yo&apos;q
                      </button>
                    </div>
                  ) : (
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => void toggleStatus(barber)}
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
                        disabled={isBusy}
                        onClick={() => setConfirmDeleteId(barber.id)}
                        aria-label="Ustani o'chirish"
                        className="btn-premium flex h-8 w-8 items-center justify-center rounded-full bg-danger/10 text-danger transition-all duration-200 hover:bg-danger/20 active:scale-90 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {openBarber && (
        <BarberDetailModal
          barber={openBarber}
          isBusy={busyId === openBarber.id}
          onClose={() => setOpenId(null)}
          onToggleStatus={() => void toggleStatus(openBarber)}
          onDelete={() => void remove(openBarber.id)}
        />
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
